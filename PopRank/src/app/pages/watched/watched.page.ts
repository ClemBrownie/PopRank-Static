import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonImg, IonIcon, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { Entry } from '../../models/entry.model';

@Component({
  selector: 'app-watched',
  templateUrl: './watched.page.html',
  styleUrls: ['./watched.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonImg, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, CommonModule, FormsModule]
})
export class WatchedPage implements OnInit {
  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  
  entries: Entry[] = [];
  loading = false;

  constructor() { }

  ngOnInit() {
    this.loadWatchedMovies();
  }

  loadWatchedMovies() {
    this.loading = true;
    // Pour l'instant, on simule une liste vide
    // Dans une vraie app, on récupérerait depuis le service
    setTimeout(() => {
      this.entries = [];
      this.loading = false;
    }, 1000);
  }

  refreshWatchedMovies(event: any) {
    this.loadWatchedMovies();
    event.target.complete();
  }

  goToMovie(movieId: number) {
    this.router.navigate(['/movie', movieId]);
  }

  getImageUrl(posterPath: string | null | undefined): string {
    return this.tmdbService.getImageUrl(posterPath, 'w342');
  }

  getStars(rating: number): string {
    return '★'.repeat(rating);
  }

  getEmptyStars(rating: number): string {
    return '☆'.repeat(5 - rating);
  }
}
