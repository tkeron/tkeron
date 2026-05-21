export interface Quote {
  id: number;
  quote: string;
  author: string;
}

export const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const getRandomQuote = async (): Promise<Quote> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("https://dummyjson.com/quotes/random", {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as Quote;
  } catch {
    return {
      id: 0,
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const getBuildMetadata = () => ({
  timestamp: new Date().toLocaleString(),
  runtime: `Bun ${Bun.version}`,
  tkeron: process.env.TKERON_VERSION || "unknown",
  platform: process.platform,
});

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export const getCryptoPrices = async (): Promise<CryptoPrice[]> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&sparkline=false",
      { signal: controller.signal },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as CryptoPrice[];
  } catch {
    return [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 95000,
        price_change_percentage_24h: 2.5,
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        current_price: 3500,
        price_change_percentage_24h: -1.2,
      },
      {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        current_price: 180,
        price_change_percentage_24h: 5.8,
      },
    ];
  } finally {
    clearTimeout(timeout);
  }
};
