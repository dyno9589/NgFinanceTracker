import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MutualFundsService } from '../../../core/services/mutual-funds';
import { MutualFund } from '../../../core/models/mutual-fund.model';

@Component({
  selector: 'app-mf-list',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './mf-list.html',
  styleUrl: './mf-list.scss',
})
export class MfList implements OnInit {

  private svc = inject(MutualFundsService);  

  funds = this.svc.funds();
  summary = this.svc.summary();
  loading = this.svc.loading();

  ngOnInit(): void {
    this.svc.loadMockFunds();
  }

  calcFPnL(fund: MutualFund): number {
    return (fund.units * fund.currentNav) - fund.investedAmount;
  }   

  refresh():void {
    this.svc.refreshAllNavs();
  }

  remove(id: string): void {
    if(confirm('Are you sure you want to remove this fund?')) {
      this.svc.removeFund(id);
    }
  }

}
