// External API service - can be imported in .pre.ts files
// Demonstrates that pre-rendering can use any TypeScript module

export interface Quote {
  id: number;
  quote: string;
  author: string;
}

/**
 * Fetches a random quote from a public API
 * This runs at build time during pre-rendering
 */
export async function getRandomQuote(): Promise<Quote> {
  try {
    const response = await fetch('https://dummyjson.com/quotes/random');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as Quote;
  } catch (error) {
    // Fallback quote if API fails
    console.warn('API call failed, using fallback quote');
    return {
      id: 0,
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    };
  }
}

/**
 * Gets build metadata
 */
export async function getBuildMetadata() {
  return {
    timestamp: new Date().toLocaleString(),
    runtime: `Bun ${Bun.version}`,
    tkeron: process.env.TKERON_VERSION || 'unknown',
    platform: process.platform
  };
}

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

/**
 * Fetches cryptocurrency prices from CoinGecko API
 * This runs at build time during pre-rendering
 */
export async function getCryptoPrices(): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&sparkline=false'
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as CryptoPrice[];
  } catch (error) {
    // Fallback data if API fails
    console.warn('Crypto API call failed, using fallback data');
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 95000,
        price_change_percentage_24h: 2.5
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3500,
        price_change_percentage_24h: -1.2
      },
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        current_price: 180,
        price_change_percentage_24h: 5.8
      }
    ];
  }
}
