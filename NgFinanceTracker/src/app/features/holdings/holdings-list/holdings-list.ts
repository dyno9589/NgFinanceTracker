import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { HoldingsService } from '../../../core/services/holdings';

@Component({
  selector: 'app-holdings-list',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './holdings-list.html',
  styleUrl: './holdings-list.scss',
})
export class HoldingsList implements OnInit {
  private svc = inject(HoldingsService);
  
  holdings = this.svc.holdings;
  summary = this.svc.summary;

  ngOnInit(): void {
    this.svc.loadHoldings();
  }
}
