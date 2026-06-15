import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, interval, of, Subscription } from 'rxjs';
import {
  MarketIndex,
  MarketSnapshot,
  Stock
} from '../models/market.model';

@Injectable({ providedIn: 'root' })
export class MarketService {
  private http = inject(HttpClient);

  // 🔁 Replace with your API once you sign up
  // Example providers: Alpha Vantage, Finnhub, Twelve Data, RapidAPI (Indian APIs)
  private readonly API_BASE = 'https://YOUR_REAL_API_HERE';
  private readonly API_KEY = ''; // load from environment

  // ----- Reactive State -----
  indices = signal<MarketIndex[]>([]);
  topGainers = signal<Stock[]>([]);
  topLosers = signal<Stock[]>([]);
  mostActive = signal<Stock[]>([]);
  watchlist = signal<Stock[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed: combined snapshot
  snapshot = computed<MarketSnapshot>(() => ({
    indices: this.indices(),
    topGainers: this.topGainers(),
    topLosers: this.topLosers(),
    mostActive: this.mostActive()
  }));

  // Computed: overall market sentiment
  marketSentiment = computed<'Bullish' | 'Bearish' | 'Neutral'>(() => {
    const idx = this.indices();
    if (!idx.length) return 'Neutral';
    const up = idx.filter(i => i.change > 0).length;
    const down = idx.length - up;
    if (up > down) return 'Bullish';
    if (down > up) return 'Bearish';
    return 'Neutral';
  });

  private pollingSub?: Subscription;

  // ----- Public API -----
  loadMockSnapshot(): void {
    this.loading.set(true);

    this.indices.set([
      { name: 'NIFTY 50',    value: 24812.05, change: 152.30,  changePercent: 0.62,  lastUpdated: new Date() },
      { name: 'SENSEX',      value: 81234.65, change: 412.80,  changePercent: 0.51,  lastUpdated: new Date() },
      { name: 'BANK NIFTY',  value: 53420.10, change: -85.40,  changePercent: -0.16, lastUpdated: new Date() },
      { name: 'NIFTY IT',    value: 41250.75, change: 305.20,  changePercent: 0.75,  lastUpdated: new Date() }
    ]);

    this.topGainers.set([
      { symbol: 'TATAMOTORS', companyName: 'Tata Motors',   price: 985.30, change: 42.50, changePercent: 4.51 },
      { symbol: 'INFY',       companyName: 'Infosys',       price: 1652.10, change: 56.20, changePercent: 3.52 },
      { symbol: 'BAJFINANCE', companyName: 'Bajaj Finance', price: 7120.50, change: 220.0, changePercent: 3.19 }
    ]);

    this.topLosers.set([
      { symbol: 'HDFCBANK', companyName: 'HDFC Bank',  price: 1452.30, change: -38.40, changePercent: -2.58 },
      { symbol: 'RELIANCE', companyName: 'Reliance',   price: 2856.10, change: -52.30, changePercent: -1.80 },
      { symbol: 'ITC',      companyName: 'ITC Ltd',    price:  445.20, change:  -6.50, changePercent: -1.44 }
    ]);

    this.mostActive.set([
      { symbol: 'YESBANK',    companyName: 'Yes Bank',     price:   22.30, change:  0.45, changePercent:  2.06 },
      { symbol: 'IDEA',       companyName: 'Vodafone Idea', price:   14.85, change: -0.20, changePercent: -1.33 },
      { symbol: 'SUZLON',     companyName: 'Suzlon',        price:   62.10, change:  1.80, changePercent:  2.98 }
    ]);

    this.loading.set(false);
  }

  /**
   * Simulates live data — slightly tweaks prices every few seconds.
   * Replace with real WebSocket / polling once you have a paid API.
   */
  startLivePolling(intervalMs: number = 5000): void {
    this.stopLivePolling();
    this.pollingSub = interval(intervalMs).subscribe(() => {
      this.simulateTick();
    });
  }

  stopLivePolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = undefined;
  }

  // ----- Watchlist Management -----
  addToWatchlist(stock: Stock): void {
    this.watchlist.update(list =>
      list.find(s => s.symbol === stock.symbol) ? list : [...list, stock]
    );
  }

  removeFromWatchlist(symbol: string): void {
    this.watchlist.update(list => list.filter(s => s.symbol !== symbol));
  }

  // ----- Real API Hooks (swap mocks with these) -----
  fetchIndicesReal(): Observable<MarketIndex[]> {
    const url = `${this.API_BASE}/indices?apikey=${this.API_KEY}`;
    return this.http.get<MarketIndex[]>(url).pipe(
      catchError(err => {
        console.error('Indices fetch failed', err);
        this.error.set('Unable to fetch market indices');
        return of([]);
      })
    );
  }

  fetchQuote(symbol: string): Observable<Stock | null> {
    const url = `${this.API_BASE}/quote?symbol=${symbol}&apikey=${this.API_KEY}`;
    return this.http.get<Stock>(url).pipe(catchError(() => of(null)));
  }

  // ----- Internal -----
  private simulateTick(): void {
    const jitter = () => (Math.random() - 0.5) * 0.4; // ±0.2%

    this.indices.update(list =>
      list.map(i => {
        const delta = i.value * (jitter() / 100);
        const newValue = +(i.value + delta).toFixed(2);
        const newChange = +(i.change + delta).toFixed(2);
        return {
          ...i,
          value: newValue,
          change: newChange,
          changePercent: +((newChange / (newValue - newChange)) * 100).toFixed(2),
          lastUpdated: new Date()
        };
      })
    );

    const updateStocks = (list: Stock[]) =>
      list.map(s => {
        const delta = s.price * (jitter() / 100);
        const newPrice = +(s.price + delta).toFixed(2);
        const newChange = +(s.change + delta).toFixed(2);
        return {
          ...s,
          price: newPrice,
          change: newChange,
          changePercent: +((newChange / (newPrice - newChange)) * 100).toFixed(2)
        };
      });

    this.topGainers.update(updateStocks);
    this.topLosers.update(updateStocks);
    this.mostActive.update(updateStocks);
  }
}