import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArcElement, Chart } from "chart.js";
import { useEffect, useState } from "react";
import { AssetAllocationChart } from "./asset-allocation-chart";
Chart.register(ArcElement);

export interface TokenData {
  name: string;
  symbol: string;
  value_usd: number;
  contract_address?: string;
}

const colors = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#ef4444", // red
  "#6366f1", // indigo
];

function getColor(index: number): string {
  return colors[index % colors.length];
}

export function AssetAllocationCard({
  address,
  chain_id,
}: {
  address: string;
  chain_id: string;
}) {
  const [tokens, setTokens] = useState<TokenData[]>([]);

  useEffect(() => {
    async function fetchTokenData() {
      const params = new URLSearchParams();
      params.append("address", address);
      params.append("chain_id", chain_id);
      params.append("use_cache", "true");

      try {
        const res = await fetch(
          `/api/1inch/portfolio/tokens/details?${params.toString()}`
        );
        const data = await res.json();
        if (!data?.result) return;

        // Filter and sort
        const nonZeroTokens = data.result.filter(
          (t: TokenData) => t.value_usd > 0
        );
        nonZeroTokens.sort(
          (a: TokenData, b: TokenData) => b.value_usd - a.value_usd
        );

        // Group small tokens into "Others"
        const topTokens = nonZeroTokens.slice(0, 4);
        const others = nonZeroTokens.slice(4);
        const othersTotal = others.reduce(
          (acc: number, t: TokenData) => acc + t.value_usd,
          0
        );

        const finalTokens: TokenData[] = topTokens.map((t: TokenData) => ({
          symbol: t.symbol,
          value_usd: t.value_usd,
        }));

        if (othersTotal > 0) {
          finalTokens.push({
            symbol: "Others",
            name: "Others",
            value_usd: othersTotal,
          });
        }

        setTokens(finalTokens);
      } catch (error) {
        console.error("Failed to fetch token data:", error);
      }
    }

    fetchTokenData();
  }, [address, chain_id]);

  const totalValue = tokens.reduce((acc, token) => acc + token.value_usd, 0);
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>Breakdown of your portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[240px] w-full">
            <AssetAllocationChart data={tokens} />
          </div>
          <div className="space-y-2">
            {tokens.map((token, index) => {
              const percent = ((token.value_usd / totalValue) * 100).toFixed(1);

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: getColor(index), // use a helper for color
                      }}
                    ></div>
                    <span className="text-sm font-medium">{token.symbol}</span>
                  </div>
                  <div className="text-sm">{percent}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
