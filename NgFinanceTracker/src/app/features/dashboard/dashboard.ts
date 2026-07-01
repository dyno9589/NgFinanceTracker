import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MarketService } from '../../core/services/market';
import { MutualFundsService } from '../../core/services/mutual-funds';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit , OnDestroy {
  private market = inject(MarketService);
  private mfSvc = inject(MutualFundsService);

  indices = this.market.indices;
  gainers = this.market.topGainers;
  losers = this.market.topLosers;
  sentiment = this.market.marketSentiment;
  mfSummary = this.mfSvc.summary;

  ngOnInit(): void {
    this.market.loadMockSnapshot();
    this.market.startLivePolling(5000);
    this.mfSvc.loadMockFunds();
  }

  ngOnDestroy(): void {
    this.market.stopLivePolling();
  }

}
