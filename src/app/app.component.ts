import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DbService } from './services/db/db.service';
import { Observable, Subscription, exhaustMap, of, switchMap } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { LogPanelComponent } from './components/shared/log-panel/log-panel.component';
import { LoaderComponent } from './components/shared/loader/loader.component';
import { LoaderService } from './services/loader/loader.service';
import { EskomSePushConfig } from './core/models/common/Settings/user-app-settings';

export interface ComponentNavItem {
  path: string
  icon: string
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatTabsModule,
    RouterModule,
    MatIconModule,
    LoaderComponent,
    LogPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent implements OnInit, OnDestroy {

  navigation: ComponentNavItem[] = [];
  subscriptions: Subscription[] = [];

  constructor(
    private db: DbService,
    private logger: NGXLogger,
    public loader: LoaderService,
    public router: Router
  ) { }

  ngOnInit(): void {
    let syncSub = this.db.sync()
      .pipe(
        switchMap(result => {
          return this.db.getUserSettings;
        }),
        exhaustMap(result => {
          if (result.isLoaded == false || ((result.data?.eskomSePushApiKey) ? true : false) == false) {
            return this._loadSetupPages();
          } else {
            return this._loadUserPages(result.data!);
          }
        })
      ).subscribe();

      this.subscriptions.push(syncSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  _loadUserPages(config: EskomSePushConfig): Observable<boolean> {
    this.logger.info('Eskom Se Push API Key has been saved. Loading Default Pages based on user settings.');

    let navItems = [
      { path: 'areas/my', icon: 'home' },
      { path: 'areas/add', icon: 'manage_search' }
    ];

    if (config.pagesAllowance) {
      navItems.push({ path: 'allowance', icon: 'wallet' });
    }

    if (config.pagesSetup) {
      navItems.push({ path: 'page_setup', icon: 'key' });
    }

    navItems.push({ path: 'settings', icon: 'settings' });

    this.navigation = navItems;

    return of(true);
  }

  _loadSetupPages(): Observable<boolean> {
    this.logger.info('Eskom Se Push API Key has not been saved yet. Loading Initial Setup Pages.');

    this.navigation = [
      { path: 'page_setup', icon: 'key' },
      { path: 'settings', icon: 'settings' }
    ];

    //IF YOU ARE LOADING THE SETUP PAGES MAKE THE SETUP PAGE THE LANDING SITE
    this.router.navigate(['page_setup']);

    return of(false);
  }

}
