import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract parameters from the request
        const address = searchParams.get('address');
        const chain_id = searchParams.get('chain_id');
        const timerange = searchParams.get('timerange');
        const use_cache = searchParams.get('use_cache');

        // Validate required parameters
        if (!address || !chain_id) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Get API key from environment variable
        const apiKey = process.env.NEXT_PUBLIC_ONE_INCH_API;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        const portfolioApis = ["general/current_value", "general/profit_and_loss", "general/value_chart"]
        const portfolioUrls = portfolioApis.map((api) => {
            // Build the URL with query parameters
            const url = new URL(`https://api.1inch.dev/portfolio/portfolio/v4/${api}`);
            url.searchParams.append('addresses', address);
            url.searchParams.append('chain_id', chain_id);
            if (use_cache) url.searchParams.append('use_cache', use_cache);
            if (timerange) url.searchParams.append('timerange', timerange);
            return url;
        })

        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
        const jsonArr = [];

        for (const url of portfolioUrls) {
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: "application/json",
                },
            });
            const json = await res.json();
            jsonArr.push(json);
            await delay(500); // optional: adjust based on observed rate limit
        }

        return NextResponse.json(
            {
                value: jsonArr[0],
                profitAndLoss: jsonArr[1],
                chart: jsonArr[2],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
    }
}