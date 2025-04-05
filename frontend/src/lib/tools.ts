import { tool } from "ai";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../.env" });

//"GetTokenTransfersByAccount provides a historical record of all ERC-20 token transfers for a specific wallet address, revealing patterns in buying, selling, and accumulation behavior. By analyzing transaction frequency, transfer sizes, and counterparties, it can help identify whether an address is actively trading, holding, or distributing tokens. Large inbound transfers from exchanges may indicate accumulation, while large outbound transfers to exchanges suggest potential sell-offs. Tracking interactions with known liquidity pools, smart contracts, or other whales can provide insights into an entity’s trading strategies, yield farming activities, or participation in airdrops. This data is useful for monitoring influential market participants and predicting potential token movements."s
export const getTokenTransfersByAccount = tool({
  parameters: z.object({
    accountAddress: z.string(),
    protocol: z.string(),
    network: z.string(),
    fromDate: z.string(),
    toDate: z.string(),
  }),
  description: "Get token transfers by account",
  execute: async ({ accountAddress, protocol, network, fromDate, toDate }) => {
    console.log("getTokenTransfersByAccount");
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/token/getTokenTransfersByAccount`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.NODIT_API_KEY!,
      },
      body: JSON.stringify({
        accountAddress: accountAddress,
        fromDate,
        toDate,
        withCount: false,
        withZeroValue: false,
        rpp: 3,
      }),
    };
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return data;
  },
});

//GetTokenTransfersByContract provides detailed insights into the transaction history of a specific ERC-20 token, revealing patterns such as spikes in trading volume, liquidity shifts, and large whale movements. By analyzing transfer sizes and frequency, it can help detect accumulation phases, sell-offs, and token distribution trends. Monitoring exchange-related transfers can indicate whether a token is being offloaded (sell pressure) or withdrawn for holding (bullish signal). Sudden increases in transaction activity may suggest an upcoming event, airdrop farming, or coordinated market moves. This data is useful for identifying arbitrage opportunities, tracking major holders, and assessing the overall market sentiment toward a token.
export const getTokenTransfersByContract = tool({
  parameters: z.object({
    contractAddress: z.string(),
    protocol: z.string(),
    network: z.string(),
    fromDate: z.string(),
    toDate: z.string(),
  }),
  description: "Get Token Transfers by Contract Address",
  execute: async ({ contractAddress, protocol, network, fromDate, toDate }) => {
    console.log("getTokenTransfersByContract", {
      contractAddress,
      protocol,
      network,
    });
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/token/getTokenTransfersByContract`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.NODIT_API_KEY!,
      },
      body: JSON.stringify({
        contractAddress,
        fromDate,
        toDate,
        withCount: false,
        withZeroValue: false,
        rpp: 3,
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return data;
  },
});

//"GetTokenTransfersWithinRange provides a time-based view of ERC-20 token transfer activity, allowing detection of short-term trading trends, liquidity surges, and whale movements within a specified period. By analyzing transaction volume spikes, it can highlight periods of increased market interest, potential manipulation, or coordinated buying and selling. Large transfers within a short timeframe may indicate accumulation by whales or sell-offs before major market events. This data is valuable for front-running opportunities, detecting arbitrage conditions, monitoring token distribution patterns, and assessing the broader market sentiment around a token within a given timeframe."
export const getTokenTransfersWithinRange = tool({
  parameters: z.object({
    protocol: z.string(),
    network: z.string(),
    fromDate: z.string(),
    toDate: z.string(),
  }),
  description: "Get Token Transfers within a certain timeframe",
  execute: async ({ fromDate, toDate, protocol, network }) => {
    console.log("getTokenTransfersWithinRange");
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/token/getTokenTransfersByContract`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.NODIT_API_KEY!,
      },
      body: JSON.stringify({
        withCount: false,
        withZeroValue: false,
        fromDate,
        toDate,
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return data;
  },
});

export const getDailyActiveAccountStatsByContract = tool({
  parameters: z.object({
    protocol: z.string(),
    network: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    contractAddress: z.string(),
  }),
  execute: async ({
    startDate,
    endDate,
    protocol,
    network,
    contractAddress,
  }) => {
    console.log("getDailyActiveAccountStatsByContract", {
      startDate,
      endDate,
      protocol,
      network,
      contractAddress,
    });
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/stats/getDailyActiveAccountsStatsByContract`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.NODIT_API_KEY!,
      },
      body: JSON.stringify({
        contractAddress,
        startDate,
        endDate,
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return data;
  },
});

export const getDailyTransactionsStatsByContract = tool({
  parameters: z.object({
    protocol: z.string(),
    network: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    contractAddress: z.string(),
  }),
  execute: async ({
    startDate,
    endDate,
    protocol,
    network,
    contractAddress,
  }) => {
    console.log("getDailyTransactionsStatsByContract", {
      startDate,
      endDate,
      protocol,
      network,
      contractAddress,
    });
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/stats/getDailyTransactionsStatsByContract`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.NODIT_API_KEY!,
      },
      body: JSON.stringify({
        contractAddress,
        startDate,
        endDate,
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return data;
  },
});

export const getTokenContractMetadataByContracts = tool({
  parameters: z.object({
    protocol: z.string(),
    network: z.string(),
    contractAddresses: z.array(z.string()),
  }),
  description: "Get Token Transfers within a certain timeframe",
  execute: async ({ contractAddresses, protocol, network }) => {
    console.log("getTokenContractMetadataByContracts");
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/token/getTokenContractMetadataByContracts`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.NODIT_API_KEY!,
      },
      body: JSON.stringify({
        contractAddresses,
      }),
    };
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return data;
  },
});

export const getTokenHoldersByContract = tool({
  parameters: z.object({
    protocol: z.string(),
    network: z.string(),
    contractAddress: z.string(),
  }),
  execute: async ({ contractAddress, protocol, network }) => {
    console.log("getTokenHoldersByContract", contractAddress, protocol, network);
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/token/getTokenHoldersByContract`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.NODIT_API_KEY!,
      },
      body: JSON.stringify({
        withCount: false,
        contractAddress,
      }),
    };
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return data;
  },
});

export const getTokenPricesByContract = tool({
  parameters: z.object({
    protocol: z.string(),
    network: z.string(),
    contractAddresses: z.array(z.string()),
  }),
  execute: async ({ contractAddresses, protocol, network }) => {
    console.log("getTokenPricesByContract", {
      contractAddresses,
      protocol,
      network,
    });
    const url = `https://web3.nodit.io/v1/${protocol}/${network}/token/getTokenPricesByContracts`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.NODIT_API_KEY!,
      },
      body: JSON.stringify({
        currency: "USD",
        contractAddresses,
      }),
    };
    const response = await fetch(url, options);
    const data = await response.json();

    return data?.map((token: any) => ({
      currency: token.currency,
      price: token.price,
      volumeFor24h: token.volumeFor24h,
      percentChangeFor1h: token.percentChangeFor1h,
      percentChangeFor24h: token.percentChangeFor24h,
      percentChangeFor7d: token.percentChangeFor7d,
      marketCap: token.marketCap,
    }));
  },
});

export const getTokenPricesByContract1Inch = tool({
  parameters: z.object({
    protocol: z.string(),
    network: z.string(),
    contractAddresses: z.array(z.string()),
  }),
  execute: async ({ contractAddresses, protocol, network }) => {
    console.log("getTokenPricesByContract1Inch", {
      contractAddresses,
      protocol,
      network,
    });
    const url = `https://api.1inch.dev/token-details/v1.0/prices/change/8453`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-API-KEY": process.env.NEXT_PUBLIC_ONE_INCH_API!,
      },
      body: JSON.stringify({
        tokenAddresses: contractAddresses,
        interval: "14d",
      }),
    };
    const response = await fetch(url, options);
    const data = await response.json();

    console.log(data);

    return data?.map((token: any) => ({
      priceChangeFor14d: token.inUSD,
      percentChangeFor14d: token.inPercent,
    }));
  },
});
