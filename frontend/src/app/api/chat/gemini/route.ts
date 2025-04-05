import { StreamData, streamText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import axios from "axios";
import { createClient } from "@/lib/supabase";
import { systemPrompt } from "@/app/app/chatbot/page";
import {
  getTokenTransfersByAccount,
  getTokenTransfersByContract,
  getDailyActiveAccountStatsByContract,
  getDailyTransactionsStatsByContract,
  getTokenContractMetadataByContracts,
  getTokenHoldersByContract,
  getTokenPricesByContract,
} from "@/lib/tools";
import { openai } from "@ai-sdk/openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const now = new Date();
  const month = new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    month: "long",
  }).format(now);
  const day = new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    day: "numeric",
  }).format(now);
  const year = new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    year: "numeric",
  }).format(now);
  const { messages, toolDefaults = {} } = await req.json();
  console.log(messages);
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  const { chain, walletAddress, limit, offset, queryId, userId } = toolDefaults;

  const defaultsContext = [
    chain && `Chain to use: ${chain}`,
    walletAddress && `Wallet address to use: ${walletAddress}`,
    queryId && `Default Dune query ID: ${queryId}`,
    `and User ID: ${userId}`,
  ]
    .filter(Boolean)
    .join("\n");

  const fullSystemPrompt = `${systemPrompt}

  ${
    defaultsContext
      ? `User's details:\n${defaultsContext}
  
  You can use these defaults when the user doesn't specify values explicitly. DO NOT ASK THE USER AGAIN IF DEFAULTS ARE USED`
      : ""
  }`;

  const data = new StreamData();

  const result = streamText({
    model: openai("gpt-4o"),
    system: `${
      defaultsContext
        ? `User's details:\n${defaultsContext}
    
    You can use these defaults when the user doesn't specify values explicitly. DO NOT ASK THE USER AGAIN IF DEFAULTS ARE USED`
        : ""
    } 
    
    You are a crypto micro-investing assistant designed to help users invest in cryptocurrencies by providing insights and recommendations based on whale activity, token movements, and market trends. Your goal is to assist users in making informed investment decisions while maintaining a professional tone at all times.
    
    Key Guidelines:
    Only analyze past 7 days of data.
    
    Always analyze multiple whale accounts, using the provided list. Example: [0xd746a2a6048c5d3aff5766a8c4a0c8cfd2311745].
    
    If users dont mention a specific token name or address, please use some tools with the whale addresses provided above.
    
    Focus on Ethereum and Base mainnets for analysis.
    
    Consider tokens with significant market movements, high liquidity, and frequent large transactions.
    
    Use multiple tools to provide the most comprehensive insights and avoid relying on a single data point, however, please make sure you do not call multiple tools asynchrously. Always wait for the previous tool to finish before calling the next one. Please also do not result in rate limiting for GPT-4o. 
    
    Available Tools & Their Purpose:
    1. Whale & Account Activity Tracking
    getTokenTransfersByAccount (NOTE that the values are in cryptocurrency units, you have to divide by 10^18 to get the actual amount)
    
    Retrieves historical ERC-20 token transfers for a specific wallet.
    
    Helps identify buying, selling, accumulation, or distribution patterns.
    
    Can detect large inflows from exchanges (accumulation) or large outflows to exchanges (potential sell-offs).
    
    Tracks interactions with liquidity pools, smart contracts, or other whales, offering insights into yield farming, airdrops, and trading strategies.
    Required Input: fromDate and toDate in ISO 8601 format (YYYY-MM-DDThh:mm:ssZ).
    
    Example: 2025-03-25T15:30:00Z (always use UTC time).
    
    2. Token-Specific Market Analysis
    getTokenTransfersByContract
    
    Retrieves all ERC-20 token transfers for a specific contract.
    
    Helps detect trading volume spikes, liquidity shifts, and whale movements.
    
    Can indicate accumulation phases, sell-offs, and market sentiment shifts.
    
    Exchange-related transfers help assess buying pressure (withdrawals) vs. selling pressure (deposits).
    
    Identifies potential arbitrage opportunities and high-activity tokens.
    
    3. Time-Based Market Trend Detection
    getTokenTransfersWithinRange
    
    Retrieves token transfers within a specific time frame (past 7 days).
    
    Identifies short-term trading trends, liquidity surges, and coordinated whale movements.
    
    Helps detect market manipulation, front-running opportunities, and arbitrage conditions.
    
    Required Input: fromDate and toDate in ISO 8601 format (YYYY-MM-DDThh:mm:ssZ).
    
    Example: 2025-03-25T15:30:00Z (always use UTC time).
    
    4. Ethereum Mainnet Market Statistics
    (Only applicable to Ethereum mainnet transactions)
    
    getDailyActiveAccountStatsByContract
    
    Analyzes daily active user trends for a specific token contract.
    
    Identifies whether a token is gaining or losing interest among traders.
    
    getDailyTransactionsStatsByContract
    
    Retrieves daily transaction count trends for a token contract.
    
    Helps assess market activity levels and investor engagement.
    
    5. Token Price & Liquidity Analysis
    getTokenPricesByContract
    
    Fetches historical price data for a specific token contract.
    Useful for identifying price trends, volatility, and liquidity conditions.
    
    6. Token Ownership & Metadata Insights
    getTokenContractMetadataByContracts
    
    Fetches contract-level metadata for a given token.
    
    Useful for identifying tokenomics, supply details, and smart contract attributes.
    
    getTokenHoldersByContract
    
    Retrieves a list of token holders, showing whale concentrations and distribution patterns.
    
    Helps detect whether a token is becoming more decentralized or concentrated among a few holders.
    
    General Instructions for the AI Agent:
    
    Prioritize Ethereum mainnet insights.
    
    Monitor recent trends (last 7 days) and identify large token movements to detect opportunities early.
    
    Ensure that the analysis includes whale activity, market sentiment, and liquidity conditions.
    
    Always provide recommendations that align with the user’s investment goals and risk tolerance.
    
    Always provide some numbers and stats no matter what to back up your analysis. For example, if you say that the price is going up, provide the percentage increase and the time frame.
    
    Always use getTokenPricesByContract first whenever you are analyzing a token. This is to ensure that you have the most accurate and up-to-date information about the token's price and market conditions. Then use the other tools to analyze the token's movements and trends. You must use at least 2 tools everytime. If you think you need to use more than 2 tools, please do so, in fact you should use as many tools as you need to get the most accurate and comprehensive analysis possible, but do not use more than 30000 tokens in total.
    
    Today's Date Format:
    The current date is ${year}-${month}-${day} (YYYY-MM-DD format). You should just ignore today when analysing the data.`,
    messages,
    maxSteps: 5,
    tools: {
      getTokenTransfersByAccount,
      getTokenTransfersByContract,
      getDailyActiveAccountStatsByContract,
      getDailyTransactionsStatsByContract,
      getTokenContractMetadataByContracts,
      getTokenHoldersByContract,
      getTokenPricesByContract,
      listTransactions: tool({
        description:
          "List transactions for a wallet address on a specific blockchain",
        parameters: z.object({
          chain: z.string().describe('The blockchain name (e.g., "ethereum")'),
          walletAddress: z
            .string()
            .optional()
            .describe("The wallet address to query transactions for"),
          limit: z
            .number()
            .optional()
            .describe("Maximum number of transactions to return"),
          offset: z
            .number()
            .optional()
            .describe("Number of transactions to skip"),
        }),
        execute: async (params, { toolCallId }) => {
          const executionParams = {
            chain: params.chain || chain,
            walletAddress: params.walletAddress || walletAddress,
            limit: params.limit || limit || 10,
            offset: params.offset || offset || 0,
          };

          data.appendMessageAnnotation({
            type: "tool-status",
            toolCallId,
            status: "in-progress",
          });

          try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_MULTIBAAS_URL;
            const apiKey = process.env.NEXT_PUBLIC_BASE_MULTIBAAS_API;

            if (!baseUrl || !apiKey) {
              throw new Error("MultiBaas configuration is missing");
            }

            const url = `${baseUrl}/chains/${executionParams.chain}/txm/${executionParams.walletAddress}`;
            const response = await axios.get(url, {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
              },
              params: {
                limit,
                offset,
              },
            });

            const transactions = response.data.result.map(
              (txData: {
                tx: { hash: string; to: string; value: string };
                from: string;
                blockNumber: string;
                createdAt: string;
                status: string;
                failed: boolean;
              }) => ({
                hash: txData.tx.hash,
                from: txData.from,
                to: txData.tx.to,
                value: parseInt(txData.tx.value, 16) / 1e18, // Convert hex value to ETH
                blockNumber: parseInt(txData.blockNumber, 10),
                timestamp: txData.createdAt,
                status: txData.status,
                failed: txData.failed,
              })
            );

            const result = {
              transactions,
              total: transactions.length,
              chain,
              walletAddress,
            };

            // Mark the tool call as completed
            data.appendMessageAnnotation({
              type: "tool-status",
              toolCallId,
              status: "completed",
            });

            // Add a special annotation to render with a custom component
            data.appendMessageAnnotation({
              type: "custom-render",
              toolCallId,
              componentName: "TransactionList",
              data: result,
            });
            return JSON.stringify(result);
          } catch (error) {
            console.error("Transaction listing error:", error);
            data.appendMessageAnnotation({
              type: "tool-status",
              toolCallId,
              status: "error",
            });

            return JSON.stringify({
              error: "Failed to fetch wallet transactions",
              details:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            });
          }
        },
      }),
      queryDuneAnalytics: tool({
        description: "Query Dune Analytics for blockchain data insights",
        parameters: z.object({
          limit: z
            .number()
            .optional()
            .describe("Maximum number of results to return"),
          params: z
            .record(z.string())
            .optional()
            .describe("Optional parameters to pass to the query"),
        }),
        execute: async (params, { toolCallId }) => {
          const executionParams = {
            limit: params.limit || limit || 25,
            params: params.params || {},
          };

          data.appendMessageAnnotation({
            type: "tool-status",
            toolCallId,
            status: "in-progress",
          });

          try {
            const duneApiKey = process.env.NEXT_PUBLIC_DUNE_API_KEY;

            if (!duneApiKey) {
              throw new Error("Dune API key is missing");
            }

            const queryParams = new URLSearchParams({
              limit: executionParams.limit.toString(),
            }).toString();
            const url = `https://api.dune.com/api/v1/query/1001498/results?${queryParams}`;
            const response = await axios({
              method: "get",
              url: url,
              headers: {
                "X-Dune-API-Key": duneApiKey,
                Accept: "application/json",
              },
              validateStatus: (status) => status === 200,
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
                etherscanLink: `https://etherscan.io/address/${row.address}`,
              })),
            };

            data.appendMessageAnnotation({
              type: "tool-status",
              toolCallId,
              status: "completed",
            });

            data.appendMessageAnnotation({
              type: "custom-render",
              toolCallId,
              componentName: "DuneAnalytics",
              data: formattedResults,
            });

            return JSON.stringify(formattedResults);
          } catch (error) {
            console.error("Dune Analytics query error:", error);
            data.appendMessageAnnotation({
              type: "tool-status",
              toolCallId,
              status: "error",
            });

            return JSON.stringify({
              error: "Failed to fetch Dune Analytics data",
              details:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            });
          }
        },
      }),
      supaBase: tool({
        description:
          'Query user profile and portfolio data from Supabase. Use this for identity questions like "who am I" or "what is my name"',
        parameters: z.object({
          table: z
            .enum(["users", "portfolio"])
            .describe("The table to query from"),
          userId: z.string().optional().describe("The user ID to query for"),
        }),
        execute: async (params, { toolCallId }) => {
          data.appendMessageAnnotation({
            type: "tool-status",
            toolCallId,
            status: "in-progress",
          });

          try {
            const supabase = createClient();
            const { table } = params;

            const { data: result, error } = await supabase
              .from(table)
              .select("id,walletAddress,name,displayPicture,email")
              .eq("id", params.userId)
              .single();

            console.log(data, params.userId);

            if (error) throw error;

            const formattedResults = {
              table,
              data: result,
            };

            data.appendMessageAnnotation({
              type: "tool-status",
              toolCallId,
              status: "completed",
            });

            data.appendMessageAnnotation({
              type: "custom-render",
              toolCallId,
              componentName: "ProfileData",
              data: formattedResults,
            });

            return JSON.stringify(formattedResults);
          } catch (error) {
            console.error("Supabase query error:", error);
            data.appendMessageAnnotation({
              type: "tool-status",
              toolCallId,
              status: "error",
            });

            return JSON.stringify({
              error: "Failed to fetch profile data",
              details:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            });
          }
        },
      }),
    },
    onFinish() {
      data.close();
    },
  });

  return result.toDataStreamResponse({ data });
}
