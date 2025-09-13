import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then( m => m.AuthPage)
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/feed/feed.page').then( m => m.FeedPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'movie/:id',
    loadComponent: () => import('./pages/movie/movie.page').then( m => m.MoviePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.page').then( m => m.SearchPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'watched',
    loadComponent: () => import('./pages/watched/watched.page').then( m => m.WatchedPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'watchlist',
    loadComponent: () => import('./pages/watchlist/watchlist.page').then( m => m.WatchlistPage),
    canActivate: [AuthGuard]
  },
];
