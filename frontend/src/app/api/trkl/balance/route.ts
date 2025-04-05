import TRKL_ABI from '@/abi/TRKL.json';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract parameters from the request
        const userAddress = searchParams.get('address');

        const provider = new ethers.JsonRpcProvider(process.env.SAGA_RPC_URL)
        const wallet = new ethers.Wallet(process.env.SAGA_WALLET_PRIVATE_KEY!, provider)
        const contract = new ethers.Contract(process.env.TRKL_CONTRACT_ADDRESS!, TRKL_ABI, wallet)

        // Check balance after mint
        const balance = await contract.balanceOf(userAddress);
        const formattedBalance = ethers.formatUnits(balance, 18);

        return NextResponse.json({
            balance: formattedBalance,
        })
    } catch (error: any) {
        console.error('Minting failed:', error)
        return NextResponse.json({ error: 'Minting failed', detail: error.message }, { status: 500 })
    }
}