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
    queryId
  } = toolDefaults;

  const defaultsContext = [
    chain && `Chain to use: ${chain}`,
    walletAddress && `Wallet address to use: ${walletAddress}`,
    queryId && `Default Dune query ID: ${queryId}`,
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
    },
    onFinish() {
      data.close();
    }
  });

  return result.toDataStreamResponse({ data });
}