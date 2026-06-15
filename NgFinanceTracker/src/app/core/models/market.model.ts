export interface MarketIndex {
  name: string;            // NIFTY 50, SENSEX, BANK NIFTY
  value: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface Stock {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export interface MarketSnapshot {
  indices: MarketIndex[];
  topGainers: Stock[];
  topLosers: Stock[];
  mostActive: Stock[];
}