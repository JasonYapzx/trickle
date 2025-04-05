import TRICKLENFT_ABI from '@/abi/tricklenft.json';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract parameters from the request
        const userAddress = searchParams.get('address');

        const provider = new ethers.JsonRpcProvider(process.env.SAGA_RPC_URL)
        const wallet = new ethers.Wallet(process.env.SAGA_WALLET_PRIVATE_KEY!, provider)
        const contract = new ethers.Contract(process.env.SAGA_NFT_ADDRESS!, TRICKLENFT_ABI, wallet)

        // Check balance after mint
        const balance = await contract.balanceOf(userAddress);
        const ownsNFT = balance > 0;

        return NextResponse.json({
            ownsNFT: ownsNFT,
        })
    } catch (error: any) {
        console.error('Get NFT failed:', error)
        return NextResponse.json({ error: 'Get NFT', detail: error.message }, { status: 500 })
    }
}