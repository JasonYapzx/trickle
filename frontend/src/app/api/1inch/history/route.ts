import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract parameters from the request
        const address = searchParams.get('address');
        const chainId = searchParams.get('chainId');
        const limit = searchParams.get('limit');
        const tokenAddress = searchParams.get('tokenAddress');
        const toTimestampMs = searchParams.get('toTimestampMs');
        const fromTimestampMs = searchParams.get('fromTimestampMs');

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
        const url = new URL(`https://api.1inch.dev/history/v2.0/history/${address}/events`);
        url.searchParams.append('chainId', chainId);
        if (limit) url.searchParams.append('limit', limit);
        if (tokenAddress) url.searchParams.append('tokenAddress', tokenAddress);
        if (toTimestampMs) url.searchParams.append('toTimestampMs', toTimestampMs);
        if (fromTimestampMs) url.searchParams.append('fromTimestampMs', fromTimestampMs);

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
        console.error('Swap API error:', error);
        return NextResponse.json(
            { error: 'Failed to process swap request' },
            { status: 500 }
        );
    }
}