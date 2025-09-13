import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonImg, IonIcon, IonSpinner, IonButton, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.page.html',
  styleUrls: ['./watchlist.page.scss'],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonImg, IonIcon, IonSpinner, IonButton, IonRefresher, IonRefresherContent, CommonModule, FormsModule]
})
export class WatchlistPage implements OnInit {
  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  
  watchlist: any[] = [];
  loading = false;

  constructor() { }

  ngOnInit() {
    this.loadWatchlist();
  }

  loadWatchlist() {
    this.loading = true;
    // Pour l'instant, on simule une liste de souhaits vide
    // Dans une vraie app, on récupérerait depuis un service
    setTimeout(() => {
      this.watchlist = [];
      this.loading = false;
    }, 1000);
  }

  refreshWatchlist(event: any) {
    this.loadWatchlist();
    event.target.complete();
  }

  goToMovie(movieId: number) {
    this.router.navigate(['/movie', movieId]);
  }

  getImageUrl(posterPath: string | null | undefined): string {
    return this.tmdbService.getImageUrl(posterPath, 'w342');
  }

  removeFromWatchlist(movieId: number) {
    // Logique pour retirer de la liste de souhaits
    this.watchlist = this.watchlist.filter(movie => movie.id !== movieId);
  }

  goToSearch() {
    this.router.navigate(['/tabs/search']);
  }
}
