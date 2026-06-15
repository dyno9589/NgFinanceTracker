export interface Holding{

id: string;
symbol: string;
companyName: string;
quantity: number;
avgBuyPrice: number;
currentPrice: number;
sector?: string;
purchaseDate: Date;
}

export interface HoldingSummary{
totalInvested: number;
currentValue: number;
totalPnL: number;
totalPnLPercent: number;
}