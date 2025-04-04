import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract parameters from the request
        const address = searchParams.get('address');
        const chainId = searchParams.get('chainId');
        const use_cache = searchParams.get('use_cache');

        // Validate required parameters
        if (!address || !chainId) {
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

        // Build the URL with query parameters
        const url = new URL('https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/details');
        url.searchParams.append('addresses', address);
        if (chainId) url.searchParams.append('chain_id', chainId);
        if (use_cache) url.searchParams.append('use_cache', use_cache);

        // Make the request to 1inch API
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
            },
        });

        // Get the response data
        const data = await response.json();

        // Return the response
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(error);
    }
}