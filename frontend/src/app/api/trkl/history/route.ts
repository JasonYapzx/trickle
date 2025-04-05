import TRKL_ABI from '@/abi/TRKL.json';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract parameters from the request
        const walletAddress = searchParams.get('address');

        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
        }

        const provider = new ethers.JsonRpcProvider(process.env.SAGA_RPC_URL)
        const contract = new ethers.Contract(process.env.TRKL_CONTRACT_ADDRESS!, TRKL_ABI, provider)

        // Create filter for Transfer events (incoming + outgoing)
        const sentFilter = contract.filters.Transfer(walletAddress, null);
        const receivedFilter = contract.filters.Transfer(null, walletAddress);

        // Query and cast to EventLog[]
        const [sentEventsRaw, receivedEventsRaw] = await Promise.all([
            contract.queryFilter(sentFilter),
            contract.queryFilter(receivedFilter),
        ]);

        const sentEvents = sentEventsRaw as ethers.EventLog[];
        const receivedEvents = receivedEventsRaw as ethers.EventLog[];

        // Format each event with timestamp
        const formatTx = async (e: ethers.EventLog) => {
            const block = await provider.getBlock(e.blockNumber);
            return {
                txHash: e.transactionHash,
                blockNumber: e.blockNumber,
                from: e.args?.from,
                to: e.args?.to,
                amount: ethers.formatUnits(e.args?.value, 18),
                direction:
                    e.args?.from.toLowerCase() === walletAddress.toLowerCase()
                        ? "out"
                        : "in",
                timestamp: block.timestamp,
            };
        };

        const allTxs = await Promise.all(
            [...sentEvents, ...receivedEvents]
                .sort((a, b) => b.blockNumber - a.blockNumber)
                .map(formatTx)
        );

        return NextResponse.json({ history: allTxs })
    } catch (error: any) {
        console.error('Error fetching TRKL history:', error)
        return NextResponse.json({ error: 'Failed to fetch history', detail: error.message }, { status: 500 })
    }
}