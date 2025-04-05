import { StreamData, streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import axios from 'axios';
import { createClient } from '@/lib/supabase';
import { systemPrompt } from '@/app/app/chatbot/page';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, toolDefaults = {} } = await req.json();
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const google = createGoogleGenerativeAI({
    apiKey: apiKey
  });

  const {
    chain,
    walletAddress,
    limit,
    offset,
    queryId,
    userId
  } = toolDefaults;

  const defaultsContext = [
    chain && `Chain to use: ${chain}`,
    walletAddress && `Wallet address to use: ${walletAddress}`,
    queryId && `Default Dune query ID: ${queryId}`, `and User ID: ${userId}`
  ].filter(Boolean).join('\n');

  const fullSystemPrompt = `${systemPrompt}

  ${defaultsContext ? `User's details:\n${defaultsContext}
  
  You can use these defaults when the user doesn't specify values explicitly. DO NOT ASK THE USER AGAIN IF DEFAULTS ARE USED` : ''}`;

  const data = new StreamData();

  const result = streamText({
    model: google('gemini-2.0-flash-lite-preview-02-05'),
    system: fullSystemPrompt,
    messages,
    maxSteps: 5,
    tools: {
      listTransactions: tool({
        description: 'List transactions for a wallet address on a specific blockchain',
        parameters: z.object({
          chain: z.string().describe('The blockchain name (e.g., "ethereum")'),
          walletAddress: z.string().optional().describe('The wallet address to query transactions for'),
          limit: z.number().optional().describe('Maximum number of transactions to return'),
          offset: z.number().optional().describe('Number of transactions to skip')
        }),
        execute: async (params, { toolCallId }) => {
          const executionParams = {
            chain: params.chain || chain,
            walletAddress: params.walletAddress || walletAddress,
            limit: params.limit || limit || 10,
            offset: params.offset || offset || 0
          };

          data.appendMessageAnnotation({
            type: 'tool-status',
            toolCallId,
            status: 'in-progress'
          });

          try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_MULTIBAAS_URL;
            const apiKey = process.env.NEXT_PUBLIC_BASE_MULTIBAAS_API;

            if (!baseUrl || !apiKey) {
              throw new Error('MultiBaas configuration is missing');
            }

            const url = `${baseUrl}/chains/${executionParams.chain}/txm/${executionParams.walletAddress}`;
            const response = await axios.get(url, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
              },
              params: {
                limit,
                offset
              }
            });

            const transactions = response.data.result.map((txData: { tx: { hash: string; to: string; value: string }; from: string; blockNumber: string; createdAt: string; status: string; failed: boolean }) => ({
              hash: txData.tx.hash,
              from: txData.from,
              to: txData.tx.to,
              value: parseInt(txData.tx.value, 16) / 1e18, // Convert hex value to ETH
              blockNumber: parseInt(txData.blockNumber, 10),
              timestamp: txData.createdAt,
              status: txData.status,
              failed: txData.failed
            }));

            const result = {
              transactions,
              total: transactions.length,
              chain,
              walletAddress
            };

            // Mark the tool call as completed
            data.appendMessageAnnotation({
              type: 'tool-status',
              toolCallId,
              status: 'completed'
            });

            // Add a special annotation to render with a custom component
            data.appendMessageAnnotation({
              type: 'custom-render',
              toolCallId,
              componentName: 'TransactionList',
              data: result
            });
            return JSON.stringify(result);
          } catch (error) {
            console.error('Transaction listing error:', error);
            data.appendMessageAnnotation({
              type: 'tool-status',
              toolCallId,
              status: 'error'
            });

            return JSON.stringify({
              error: 'Failed to fetch wallet transactions',
              details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
          }
        }
      }),
      queryDuneAnalytics: tool({
        description: 'Query Dune Analytics for blockchain data insights',
        parameters: z.object({
          limit: z.number().optional().describe('Maximum number of results to return'),
          params: z.record(z.string()).optional().describe('Optional parameters to pass to the query')
        }),
        execute: async (params, { toolCallId }) => {
          const executionParams = {
            limit: params.limit || limit || 25,
            params: params.params || {}
          };

          data.appendMessageAnnotation({
            type: 'tool-status',
            toolCallId,
            status: 'in-progress'
          });

          try {
            const duneApiKey = process.env.NEXT_PUBLIC_DUNE_API_KEY;

            if (!duneApiKey) {
              throw new Error('Dune API key is missing');
            }

            const queryParams = new URLSearchParams({
              limit: executionParams.limit.toString()
            }).toString();
            const url = `https://api.dune.com/api/v1/query/1001498/results?${queryParams}`;
            const response = await axios({
              method: 'get',
              url: url,
              headers: {
                'X-Dune-API-Key': duneApiKey,
                'Accept': 'application/json'
              },
              validateStatus: (status) => status === 200
            });

            const duneResponse = response.data;
            const formattedResults = {
              executionId: duneResponse.execution_id,
              status: duneResponse.state,
              executedAt: duneResponse.execution_ended_at,
              wallets: duneResponse.result.rows.map((row: any) => ({
                address: row.address,
                balance: row.balance_amount,
                rank: row.rank_id,
                detailLink: row.detail_link?.replace(/(<([^>]+)>)/gi, ""),
                etherscanLink: `https://etherscan.io/address/${row.address}`
              }))
            };

            data.appendMessageAnnotation({
              type: 'tool-status',
              toolCallId,
              status: 'completed'
            });

            data.appendMessageAnnotation({
              type: 'custom-render',
              toolCallId,
              componentName: 'DuneAnalytics',
              data: formattedResults
            });

            return JSON.stringify(formattedResults);
          } catch (error) {
            console.error('Dune Analytics query error:', error);
            data.appendMessageAnnotation({
              type: 'tool-status',
              toolCallId,
              status: 'error'
            });

            return JSON.stringify({
              error: 'Failed to fetch Dune Analytics data',
              details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
          }
        }
      }),
      supaBase: tool({
        description: 'Query user profile and portfolio data from Supabase. Use this for identity questions like "who am I" or "what is my name"',
        parameters: z.object({
          table: z.enum(['users', 'portfolio']).describe('The table to query from'),
          userId: z.string().optional().describe('The user ID to query for')
        }),
        execute: async (params, { toolCallId }) => {
          data.appendMessageAnnotation({
            type: 'tool-status',
            toolCallId,
            status: 'in-progress'
          });

          try {
            const supabase = createClient();
            const { table } = params;

            const { data: result, error } = await supabase
              .from(table)
              .select('id,walletAddress,name,displayPicture,email')
              .eq('id', params.userId)
              .single();

            console.log(data, params.userId);

            if (error) throw error;

            const formattedResults = {
              table,
              data: result
            };

            data.appendMessageAnnotation({
              type: 'tool-status',
              toolCallId,
              status: 'completed'
            });

            data.appendMessageAnnotation({
              type: 'custom-render',
              toolCallId,
              componentName: 'ProfileData',
              data: formattedResults
            });

            return JSON.stringify(formattedResults);
          } catch (error) {
            console.error('Supabase query error:', error);
            data.appendMessageAnnotation({
              type: 'tool-status',
              toolCallId,
              status: 'error'
            });

            return JSON.stringify({
              error: 'Failed to fetch profile data',
              details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
          }
        }
      })
    },
    onFinish() {
      data.close();
    }
  });

  return result.toDataStreamResponse({ data });
}