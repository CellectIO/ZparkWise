import { Component, OnDestroy, OnInit } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { Subscription, map, switchMap } from 'rxjs';
import { AllowanceEntity } from '../../../core/models/entities/allowance-entity';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgStyleService } from '../../../services/ng-style/ng-style.service';
import { CardComponent } from '../../shared/card/card.component';

@Component({
  selector: 'app-allowance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    CardComponent
  ],
  templateUrl: './allowance-dashboard.component.html',
  styleUrl: './allowance-dashboard.component.sass'
})
export class AllowanceDashboardComponent implements OnInit, OnDestroy {

  allowance: AllowanceEntity | null = null;

  subscriptions: Subscription[] = [];

  constructor(private db: DbService, public ngStyleService: NgStyleService) {

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    let getSub = this.db.syncAllowance()
      .pipe(
        switchMap((result) => {
          return this.db.getAllowance
        }),
        map(result => {
          if (result.isLoaded) {
            this.allowance = result.data;
          }
        })
      ).subscribe();

    this.subscriptions.push(getSub);
  }

}
