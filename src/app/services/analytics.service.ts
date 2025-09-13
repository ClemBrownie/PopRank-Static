import { Injectable, inject } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private analytics = inject(Analytics);

  // Événements d'authentification
  logSignIn(method: string) {
    logEvent(this.analytics, 'login', {
      method: method
    });
  }

  logSignOut() {
    logEvent(this.analytics, 'logout');
  }

  // Événements de recherche
  logSearch(searchTerm: string) {
    logEvent(this.analytics, 'search', {
      search_term: searchTerm
    });
  }

  // Événements de films
  logMovieView(movieId: number, movieTitle: string) {
    logEvent(this.analytics, 'view_item', {
      item_id: movieId.toString(),
      item_name: movieTitle,
      item_category: 'movie'
    });
  }

  logMovieAdd(movieId: number, movieTitle: string, rating: number) {
    logEvent(this.analytics, 'add_to_list', {
      item_id: movieId.toString(),
      item_name: movieTitle,
      item_category: 'movie',
      rating: rating
    });
  }

  // Événements de navigation
  logPageView(pageName: string) {
    logEvent(this.analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href
    });
  }

  // Événements d'erreur
  logError(error: string, fatal: boolean = false) {
    logEvent(this.analytics, 'exception', {
      description: error,
      fatal: fatal
    });
  }

  // Événements personnalisés
  logCustomEvent(eventName: string, parameters?: { [key: string]: any }) {
    logEvent(this.analytics, eventName, parameters);
  }
}
