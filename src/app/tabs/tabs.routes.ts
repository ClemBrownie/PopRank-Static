import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'search',
        loadComponent: () =>
          import('../pages/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'watched',
        loadComponent: () =>
          import('../pages/watched/watched.page').then((m) => m.WatchedPage),
      },
      {
        path: 'watchlist',
        loadComponent: () =>
          import('../pages/watchlist/watchlist.page').then((m) => m.WatchlistPage),
      },
      {
        path: 'feed',
        loadComponent: () =>
          import('../pages/feed/feed.page').then((m) => m.FeedPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: '/tabs/search',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/search',
    pathMatch: 'full',
  },
];
