import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  MFApiResponse,
  MFSummary,
  MutualFund
} from '../models/mutual-fund.model';

@Injectable({ providedIn: 'root' })
export class MutualFundsService {
  private http = inject(HttpClient);

  // Free public API — no key required
  private readonly MF_API = 'https://api.mfapi.in/mf';
  private readonly STORAGE_KEY = 'mutual_funds';

  // ----- Reactive State (Signals) -----
  funds = signal<MutualFund[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed summary — recalculates automatically
  summary = computed<MFSummary>(() => {
    const items = this.funds();
    const invested = items.reduce((sum, f) => sum + f.investedAmount, 0);
    const current = items.reduce((sum, f) => sum + f.units * f.currentNav, 0);
    return {
      totalInvested: invested,
      currentValue: current,
      totalPnL: current - invested,
      totalPnLPercent: invested ? ((current - invested) / invested) * 100 : 0,
      activeSIPs: items.filter(f => f.sipActive).length
    };
  });

  // Group by category — useful for dashboard pie charts
  categoryBreakdown = computed(() => {
    const map = new Map<string, number>();
    this.funds().forEach(f => {
      const value = f.units * f.currentNav;
      map.set(f.category, (map.get(f.category) ?? 0) + value);
    });
    return Array.from(map, ([category, value]) => ({ category, value }));
  });

  constructor() {
    // Load from localStorage on startup
    this.restore();

    // Auto-persist on any change
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.funds()));
    });
  }

  // ----- CRUD Operations -----
  loadMockFunds(): void {
    const mock: MutualFund[] = [
      {
        id: crypto.randomUUID(),
        schemeName: 'Axis Bluechip Fund - Direct Growth',
        schemeCode: '120465',
        category: 'Equity',
        units: 250.5,
        avgNav: 42.10,
        currentNav: 55.78,
        investedAmount: 10546,
        sipActive: true,
        sipAmount: 2000,
        startDate: new Date('2023-01-15')
      },
      {
        id: crypto.randomUUID(),
        schemeName: 'Parag Parikh Flexi Cap Fund - Direct',
        schemeCode: '122639',
        category: 'Equity',
        units: 180.25,
        avgNav: 48.50,
        currentNav: 72.40,
        investedAmount: 8742,
        sipActive: true,
        sipAmount: 3000,
        startDate: new Date('2022-06-10')
      },
      {
        id: crypto.randomUUID(),
        schemeName: 'HDFC Balanced Advantage Fund',
        schemeCode: '101206',
        category: 'Hybrid',
        units: 320.0,
        avgNav: 280.0,
        currentNav: 395.6,
        investedAmount: 89600,
        sipActive: false,
        startDate: new Date('2021-11-20')
      }
    ];
    this.funds.set(mock);
  }

  addFund(fund: MutualFund): void {
    this.funds.update(list => [...list, { ...fund, id: fund.id || crypto.randomUUID() }]);
  }

  updateFund(id: string, changes: Partial<MutualFund>): void {
    this.funds.update(list =>
      list.map(f => (f.id === id ? { ...f, ...changes } : f))
    );
  }

  removeFund(id: string): void {
    this.funds.update(list => list.filter(f => f.id !== id));
  }

  // ----- Real NAV Refresh via MFAPI.in -----
  /**
   * Fetches the latest NAV for a single scheme.
   * Endpoint: https://api.mfapi.in/mf/{schemeCode}
   */
  fetchLatestNav(schemeCode: string): Observable<number | null> {
    return this.http.get<MFApiResponse>(`${this.MF_API}/${schemeCode}`).pipe(
      map(res => {
        if (res?.data?.length) {
          return parseFloat(res.data[0].nav);
        }
        return null;
      }),
      catchError(err => {
        console.error(`Failed to fetch NAV for ${schemeCode}`, err);
        return of(null);
      })
    );
  }

  /** Refresh NAV for ALL holdings */
  refreshAllNavs(): void {
    this.loading.set(true);
    this.error.set(null);

    const list = this.funds();
    if (!list.length) {
      this.loading.set(false);
      return;
    }

    let completed = 0;
    list.forEach(fund => {
      this.fetchLatestNav(fund.schemeCode).subscribe(nav => {
        if (nav !== null) {
          this.updateFund(fund.id, { currentNav: nav });
        }
        completed++;
        if (completed === list.length) {
          this.loading.set(false);
        }
      });
    });
  }

  /** Get full historical NAV (for charts) */
  getNavHistory(schemeCode: string): Observable<{ date: string; nav: number }[]> {
    return this.http.get<MFApiResponse>(`${this.MF_API}/${schemeCode}`).pipe(
      map(res => res.data.map(d => ({ date: d.date, nav: parseFloat(d.nav) }))),
      catchError(() => of([]))
    );
  }

  /** Search schemes by name — useful for "Add MF" form autocomplete */
  searchSchemes(query: string): Observable<{ schemeCode: number; schemeName: string }[]> {
    if (!query || query.length < 3) return of([]);
    return this.http
      .get<{ schemeCode: number; schemeName: string }[]>(
        `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`
      )
      .pipe(catchError(() => of([])));
  }

  // ----- Persistence -----
  private restore(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed: MutualFund[] = JSON.parse(raw);
        // Re-hydrate dates
        parsed.forEach(f => (f.startDate = new Date(f.startDate)));
        this.funds.set(parsed);
      }
    } catch (e) {
      console.warn('Failed to restore mutual funds from storage', e);
    }
  }
}