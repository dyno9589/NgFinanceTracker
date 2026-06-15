export type MFCategory = 'Equity' | 'Debt' | 'Hybrid' | 'Index' | 'ELSS' | 'Other';

export interface MutualFund {
  id: string;
  schemeName: string;
  schemeCode: string;           // used by MFAPI.in
  category: MFCategory;
  units: number;
  avgNav: number;               // average purchase NAV
  currentNav: number;
  investedAmount: number;
  sipActive: boolean;
  sipAmount?: number;
  startDate: Date;
}

export interface MFSummary {
  totalInvested: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  activeSIPs: number;
}

// Response shape from https://api.mfapi.in/mf/{code}
export interface MFApiResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
  };
  data: { date: string; nav: string }[];
  status: string;
}