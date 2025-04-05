import {
  getDailyActiveAccountStatsByContract,
  getDailyTransactionsStatsByContract,
  getTokenContractMetadataByContracts,
  getTokenHoldersByContract,
  getTokenPricesByContract,
  getTokenTransfersByAccount,
  getTokenTransfersByContract,
} from "@/lib/tools";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { NextRequest } from "next/server";

export const maxDuration = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Request body:", body);
    console.log("Messages:", JSON.stringify(body.event.messages, null, 2));

    const token_address = body.event.messages[0].token_address;

    // Make the AI call with the tool
    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: `Current date is ${new Date()}. You are a micro-investing analyzer responsible for identifying profitable token swaps while minimizing API calls. You are given this webhook data ${JSON.stringify(
            body,
            null,
            2
          )} which is triggered whenever there is an address activity in whales. From there, your goal is to abstract the token_address from event.messages. (not the from_address or to_address) and then analyze token movements, detect market trends, and decide when to recommend a swap. You have access to multiple APIs but should only call 3-4 per analysis cycle to optimize efficiency. Choose the most relevant APIs based on the situation. Always use getTokenPricesByContract first to get some general data about the token. Then, follow this process:

1. Detect Market Trends (First Check)
Use Get Daily Transactions Stats By Contract to check transaction volume in the last week. Ignore today. It supports YYYY-MM-DD format. Only run this on ethereum mainnet.

Use Get Daily Active Accounts Stats By Contract to check the number of active wallets in the last week. It supports YYYY-MM-DD format. Ignore today. Only run this on ethereum mainnet.

If a token shows strong trading activity, proceed to further analysis. Otherwise, ignore it.

2. Analyze Token Movements (Second Check)
If a token is flagged, use Get Token Transfers by Contract to analyze recent token movements. The contract address is the token_address from the webhook data you abstracted earlier. If not use ${token_address}

Look for:

Whale Activity → Single transfers larger than 5% of the token supply (potential dump signal).

Retail Accumulation → Many small transactions (potential uptrend signal).

If whales are dumping, do not recommend investing. If retail accumulation is evident, continue analysis.

3. Assess Portfolio & Make Swap Decision (Final Check)
Use Get Token Transfers by Account to track the movement of high-value wallets.

If whales are accumulating, it’s a buy signal.

If large holders are selling, it’s a sell signal.

Use Get Native Balance by Account (if needed) to check if an account has enough liquidity before recommending a swap.

Additional Considerations:
If unsure about a token, use Get Token Contract Metadata by Contracts to validate its legitimacy.

If needed, use Get Token Holders by Contract to assess decentralization (avoid recommending overly concentrated tokens).

Key Rule:
Always detect trends first, analyze movements next, and then decide on a swap. Choose only 3-4 APIs per cycle based on the scenario. Your final output should be a short and sweet sentence explaining what trends you detected, and what ultimate swap(s) you recommend. There should always be a swap recommendation and the name of the token should be stated explicitly. If you stopped at the first check, add that you did not find any strong trading activity.`,
        },
      ],
      tools: {
        getTokenTransfersByAccount,
        getTokenTransfersByContract,
        getDailyActiveAccountStatsByContract,
        getDailyTransactionsStatsByContract,
        getTokenContractMetadataByContracts,
        getTokenHoldersByContract,
        getTokenPricesByContract,
      },
      maxSteps: 10,
    });

    console.log("Result:", result.text);

    await supabase.from("ai_context").insert([
      {
        context: result.text,
      },
    ]);

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
