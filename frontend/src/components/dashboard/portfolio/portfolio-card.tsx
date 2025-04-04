import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { PortfolioChart } from "./portfolio-chart";

interface PortfolioPoint {
  timestamp: number;
  value_usd: number;
}

export const PortfolioCard = ({
  address,
  chain_id,
  timerange,
  setTimerange,
}: {
  address: string;
  chain_id: string;
  timerange: string;
  setTimerange: Dispatch<SetStateAction<string>>;
}) => {
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [currentProfitAndLoss, setCurrentProfitAndLoss] = useState<
    number | null
  >(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    async function fetchPortfolioGeneral() {
      const params = new URLSearchParams();
      params.append("address", address);
      params.append("chain_id", chain_id);
      params.append("timerange", timerange);
      params.append("use_cache", "true");

      const res = await fetch(
        `/api/1inch/portfolio/general?${params.toString()}`
      );
      const { value, profitAndLoss, chart } = await res.json();

      if (value.result && value.result.length > 0) {
        setCurrentValue(value.result[0].value_usd);
      }

      if (profitAndLoss.result && profitAndLoss.result.length > 0) {
        setCurrentProfitAndLoss(
          profitAndLoss.result.find(
            (data: { chain_id: number }) => data.chain_id === parseInt(chain_id)
          ).roi
        );
      }

      if (chart.result) {
        const data: PortfolioPoint[] = chart.result;

        const labels = data.map((point) => {
          const date = new Date(point.timestamp * 1000);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        });

        const values = data.map((point) => point.value_usd);

        const newData = {
          labels,
          datasets: [
            {
              label: "Portfolio Value",
              data: values,
              borderColor: "rgb(99, 102, 241)",
              backgroundColor: "rgba(99, 102, 241, 0.5)", // replaced with gradient later
              fill: true,
            },
          ],
        };

        setChartData(newData);
      }
    }

    fetchPortfolioGeneral();
  }, [address, chain_id, timerange]);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
        <CardDescription>
          Your total portfolio value and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {currentValue ? `${formatCurrency(currentValue)}` : "-"}
                  </h2>
                  <div
                    className={`flex items-center text-sm font-medium ${
                      currentProfitAndLoss &&
                      (currentProfitAndLoss >= 0
                        ? "text-green-500"
                        : "text-red-500")
                    }`}
                  >
                    {currentProfitAndLoss &&
                      `${formatPercentage(currentProfitAndLoss)}`}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Select value={timerange} onValueChange={setTimerange}>
                  <SelectTrigger className="h-8 w-[100px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1day">1 Day</SelectItem>
                    <SelectItem value="1week">1 Week</SelectItem>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="3years">3 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <PortfolioChart chartData={chartData} />
          </div>
          {/* <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card className="border-none shadow-none">
                <CardHeader className="p-3">
                  <CardDescription>24h Change</CardDescription>
                  <CardTitle className="flex items-center text-base">
                    <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                    3.12%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-none shadow-none">
                <CardHeader className="p-3">
                  <CardDescription>7d Change</CardDescription>
                  <CardTitle className="flex items-center text-base">
                    <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                    8.2%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-none shadow-none">
                <CardHeader className="p-3">
                  <CardDescription>30d Change</CardDescription>
                  <CardTitle className="flex items-center text-base">
                    <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                    2.4%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-none shadow-none">
                <CardHeader className="p-3">
                  <CardDescription>All-time</CardDescription>
                  <CardTitle className="flex items-center text-base">
                    <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                    124.3%
                  </CardTitle>
                </CardHeader>
              </Card>
            </div> */}
        </div>
      </CardContent>
    </Card>
  );
};
