"use client";

import {
  CheckCircle2Icon,
  ChevronDown,
  CopyIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AssetAllocationChart } from "@/components/dashboard/asset-allocation-chart";
import { PortfolioCard } from "@/components/dashboard/portfolio/portfolio-card";
import { TransactionHistory } from "../../../components/dashboard/transaction-history";

export default function Dashboard() {
  const [copied, setCopied] = useState(false);
  const [transactionType, setTransactionType] = useState<
    "All" | "Send" | "Receive" | "Transfer" | undefined
  >(undefined);
  const [portfolioTimeRange, setPortfolioTimeRange] = useState<string>("1day");
  const walletAddress = "0x7bfee91193d9df2ac0bfe90191d40f23c773c060";
  const [selectedChain, setSelectedChain] = useState<string>("Ethereum");

  const chains = [
    { name: "Ethereum", id: "1" },
    { name: "Polygon", id: "137" },
    { name: "Arbitrum", id: "42161" },
    { name: "Optimism", id: "10" },
  ];
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="w-3/4 ml-auto">
        <main className="grid flex-1 items-start gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:p-6">
          <div className="col-span-full">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">
                    Wallet Address
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <CardDescription className="text-xs sm:text-sm font-mono">
                      {walletAddress}
                    </CardDescription>
                    <Button
                      variant="default"
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <CheckCircle2Icon className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <CopyIcon className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button variant="default" size="icon" className="h-6 w-6">
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-sm px-1 py-0 text-xs"
                  >
                    Ethereum
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" size="icon" className="h-7 w-7">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View on Explorer</DropdownMenuItem>
                      <DropdownMenuItem>Export Transactions</DropdownMenuItem>
                      <DropdownMenuItem>Disconnect</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          </div>
          <div className="col-span-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="neutral"
                  className="w-full justify-between font-medium"
                >
                  {selectedChain}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="" align="start">
                {chains.map((chain) => (
                  <DropdownMenuItem
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.name)}
                  >
                    {chain.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <PortfolioCard
            address={walletAddress}
            timerange={portfolioTimeRange}
            setTimerange={setPortfolioTimeRange}
            chain_id={chains.find((c) => c.name == selectedChain).id}
          />
          <Card className="col-span-full lg:col-span-1">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Breakdown of your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-[240px] w-full">
                  <AssetAllocationChart />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium">ETH</span>
                    </div>
                    <div className="text-sm">42.5%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">BTC</span>
                    </div>
                    <div className="text-sm">28.3%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">USDC</span>
                    </div>
                    <div className="text-sm">15.2%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium">LINK</span>
                    </div>
                    <div className="text-sm">8.7%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium">Others</span>
                    </div>
                    <div className="text-sm">5.3%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Recent activity on your wallet
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="All"
                onValueChange={(value) =>
                  setTransactionType(
                    value as "All" | "Send" | "Receive" | "Transfer"
                  )
                }
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="All">All</TabsTrigger>
                  <TabsTrigger value="Send">Sent</TabsTrigger>
                  <TabsTrigger value="Receive">Received</TabsTrigger>
                  <TabsTrigger value="Transfer">Transfers</TabsTrigger>
                </TabsList>

                {/* All tabs show the same content, just filtered by state */}
                <TabsContent value="All" />
                <TabsContent value="Send" />
                <TabsContent value="Receive" />
                <TabsContent value="Transfer" />
              </Tabs>

              {/* Pass state-based `type` into TransactionHistory */}
              <TransactionHistory
                address={walletAddress}
                type={transactionType}
                chain_id={chains.find((c) => c.name == selectedChain).id}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
