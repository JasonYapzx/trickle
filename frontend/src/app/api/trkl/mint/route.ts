import TRKL_ABI from '@/abi/TRKL.json';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { userAddress, amount } = body

        const provider = new ethers.JsonRpcProvider(process.env.SAGA_RPC_URL)
        const wallet = new ethers.Wallet(process.env.SAGA_WALLET_PRIVATE_KEY!, provider)
        const contract = new ethers.Contract(process.env.TRKL_CONTRACT_ADDRESS!, TRKL_ABI, wallet)

        const tx = await contract.mint(userAddress, ethers.parseUnits(amount.toString(), 18))
        await tx.wait()

        // Check balance after mint
        const balance = await contract.balanceOf(userAddress);
        const formattedBalance = ethers.formatUnits(balance, 18);

        return NextResponse.json({
            success: true, txHash: tx.hash, newBalance: formattedBalance,
        })
    } catch (error: any) {
        console.error('Minting failed:', error)
        return NextResponse.json({ error: 'Minting failed', detail: error.message }, { status: 500 })
    }
}