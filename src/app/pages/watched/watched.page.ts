import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonImg, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { Entry } from '../../models/entry.model';

@Component({
  selector: 'app-watched',
  templateUrl: './watched.page.html',
  styleUrls: ['./watched.page.scss'],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonImg, IonSpinner, IonRefresher, IonRefresherContent, CommonModule, FormsModule]
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

  formatDate(timestamp: any): string {
    if (!timestamp) {
      return '';
    }

    let date: Date;
    
    // Si c'est déjà une Date
    if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Si c'est un objet Timestamp Firestore
    else if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
      date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    }
    // Si c'est un timestamp en millisecondes
    else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    }
    // Si c'est une string de date
    else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    else {
      return '';
    }

    return date.toLocaleDateString('fr-FR');
  }
}
