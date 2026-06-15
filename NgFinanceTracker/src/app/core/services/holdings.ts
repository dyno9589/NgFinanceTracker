import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Holding, HoldingSummary } from '../models/holding.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })      

export class HoldingsService {
    private http = inject(HttpClient);

    private apiUrl = 'https://api.example.com/holdings';

    holdings = signal<Holding[]>([]);

    summary = computed<HoldingSummary>(() => {  
    const items = this.holdings();
    const invested = items.reduce((s, h) => s + h.avgBuyPrice * h.quantity, 0);
    const current = items.reduce((s, h) => s + h.currentPrice * h.quantity, 0);
    return {
        totalInvested: invested,
        currentValue: current,
        totalPnL: current - invested,
        totalPnLPercent: invested ? ((current - invested) / invested) * 100 : 0
    };
    });

    loadHoldings(): void{
        const mock: Holding[] = [
        { id: '1', symbol: 'TCS', companyName: 'Tata Consultancy', quantity: 10, avgBuyPrice: 3200, currentPrice: 3850, sector: 'IT', purchaseDate: new Date() },
        { id: '2', symbol: 'INFY', companyName: 'Infosys', quantity: 25, avgBuyPrice: 1400, currentPrice: 1650, sector: 'IT', purchaseDate: new Date() }
    ];
    this.holdings.set(mock);
    }

    addHolding(h: Holding){
        this.holdings.update(list => [...list, h]);  
    }

    removeHolding(id: string){
        this.holdings.update(list => list.filter(h => h.id !== id));  
    }
}