import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract chain_id and all addresses
        const chain_id = searchParams.get('chain_id');
        const addresses = searchParams.getAll('addresses'); // This gets all "addresses" parameters

        if (!chain_id) {
            return NextResponse.json({ error: 'Missing chain_id' }, { status: 400 });
        }

        const apiKey = process.env.NEXT_PUBLIC_ONE_INCH_API;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        // Construct the URL
        const url = new URL(`https://api.1inch.dev/token/v1.2/${chain_id}/custom`);

        // Add each address to the URL search params
        addresses.forEach(address => url.searchParams.append('addresses', address));

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json',
            },
        });

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Token API error:', error);
        return NextResponse.json(
            { error: 'Failed to process token request' },
            { status: 500 }
        );
    }
}