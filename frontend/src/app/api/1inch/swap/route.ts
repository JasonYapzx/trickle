import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters from the request
    const src = searchParams.get("src");
    const dst = searchParams.get("dst");
    const amount = searchParams.get("amount");
    const from = searchParams.get("from");
    const origin = searchParams.get("origin");
    const slippage = searchParams.get("slippage");

    // Validate required parameters
    if (!src || !dst || !amount || !from) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_ONE_INCH_API;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Build the URL with query parameters
    const url = new URL("https://api.1inch.dev/swap/v5.2/8453/swap");
    url.searchParams.append("src", src);
    url.searchParams.append("dst", dst);
    url.searchParams.append("amount", amount);
    url.searchParams.append("from", from);
    if (origin) url.searchParams.append("origin", origin);
    if (slippage) url.searchParams.append("slippage", slippage);

    // Make the request to 1inch API
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    // Get the response data
    if (!response.ok) {
      const errorText = await response.text();
      console.error("1inch API error response:", errorText);
      return NextResponse.json(
        { error: `1inch API error: ${errorText}` },
        { status: response.status }
      );
    }

    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      console.error("Failed to parse 1inch API response:", error);
      return NextResponse.json(
        { error: "Invalid response from 1inch API" },
        { status: 500 }
      );
    }

    // Return the response
  } catch (error) {
    console.error("Swap API error:", error);
    return NextResponse.json(
      { error: "Failed to process swap request" },
      { status: 500 }
    );
  }
}
