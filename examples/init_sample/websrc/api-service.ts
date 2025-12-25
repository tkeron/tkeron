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
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform
  };
}
