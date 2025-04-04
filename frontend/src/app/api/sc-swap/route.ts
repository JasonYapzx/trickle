import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@/lib/supabase";
import { parseEther } from "ethers";

interface SwapRequest {
  walletAddress: string;
  amount: string;  // Total amount to distribute according to portfolio proportions
}

export async function POST(request: Request) {
  try {
    const body: SwapRequest = await request.json();
    const { walletAddress, amount } = body;
    const multibaasUrl = process.env.NEXT_PUBLIC_BASE_MULTIBAAS_URL;
    const multibaasApiKey = process.env.NEXT_PUBLIC_BASE_MULTIBAAS_API;
    if (!multibaasUrl || !multibaasApiKey) {
        return NextResponse.json(
          { error: "MultiBaas configuration missing" },
          { status: 500 }
        );
      }

    if (!walletAddress || !amount) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Convert amount to wei
    const amountInWei = parseEther(amount).toString();

    // Initialize Supabase client
    const supabase = createClient();

    // Get portfolio allocations
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolio')
      .select('*');

    if (portfolioError) {
      return NextResponse.json(
        { error: "Failed to fetch portfolio data", details: portfolioError.message },
        { status: 500 }
      );
    }

    if (!portfolio || portfolio.length === 0) {
      return NextResponse.json(
        { error: "No portfolio allocations found" },
        { status: 404 }
      );
    }

    // Execute swaps for each portfolio allocation
    const swapResults = [];
    const nativeToken = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Process all allocations
    for (const allocation of portfolio) {
      const swapAmount = BigInt(Math.floor(Number(amountInWei) * allocation.proportion));
      
      try {
        // Add delay between requests
        if (swapResults.length > 0) {
          await delay(3000); // 3 seconds delay between swaps
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        console.log('Making swap request with params:', {
          baseUrl,
          tokenAddress: allocation.tokenAddress,
          amount: swapAmount.toString(),
          walletAddress
        });
        const swapResponse = await axios.get(`${baseUrl}/api/1inch/swap`, {
          params: {
            src: nativeToken,
            dst: allocation.tokenAddress,
            amount: swapAmount.toString(),
            from: walletAddress,
            origin: walletAddress,
            slippage: 10,
          },
        });
        console.log('Swap response:', swapResponse.data);

        // Only proceed with MultiBaas transaction if we have valid tx data
        const txData = swapResponse.data?.tx;
        if (txData && txData.data) {
            const txResponse = await axios.post(
                `${multibaasUrl}/chains/ethereum/hsm/submit`,
                {
                  tx: {
                    gasPrice: txData.gasPrice,
                    gas: Number(txData.gas),
                    from: txData.from,
                    to: txData.to,
                    value: txData.value,
                    data: txData.data,
                    type: 0
                  }
                },
                {
                  headers: {
                    'Authorization': `Bearer ${multibaasApiKey}`,
                    'Content-Type': 'application/json'
                  }
                }
            );

            swapResults.push({
                token: allocation.token,
                type: 'swap',
                proportion: allocation.proportion,
                amount: swapAmount.toString(),
                txHash: txResponse.data.txHash || txResponse.data.hash
            });
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(`Swap error for ${allocation.token}:`, {
          error: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          params: error.config?.params
        });
        swapResults.push({
          token: allocation.token,
          type: 'error',
          error: error.response?.data?.error || 
                error.response?.data?.description || 
                error.message || 
                'Failed to execute swap'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: swapResults
    });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}