import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonImg, IonAvatar, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { EntriesService } from '../../services/entries.service';
import { TmdbService } from '../../services/tmdb.service';
import { Entry } from '../../models/entry.model';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonImg, IonAvatar, IonSpinner, IonRefresher, IonRefresherContent, CommonModule, FormsModule]
})
export class FeedPage implements OnInit {
  private entriesService = inject(EntriesService);
  private tmdbService = inject(TmdbService);
  private router = inject(Router);

  entries: Entry[] = [];
  loading = true;

  constructor() { }

  ngOnInit() {
    this.loadFeed();
  }

  async loadFeed() {
    try {
      this.entriesService.getFeedEntries(50).subscribe({
        next: (entries) => {
          this.entries = entries;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du feed:', error);
          this.entries = [];
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement du feed:', error);
      this.entries = [];
      this.loading = false;
    }
  }

  async refreshFeed(event: any) {
    await this.loadFeed();
    event.target.complete();
  }

  goToMovie(movieId: number) {
    this.router.navigate(['/movie', movieId]);
  }

  getImageUrl(posterPath: string | null | undefined): string {
    return this.tmdbService.getImageUrl(posterPath, 'w342');
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }

  getEmptyStars(rating: number): string {
    return '☆'.repeat(5 - rating);
  }

  onImageError(event: any) {
    console.log('Image error:', event);
    // Forcer l'affichage de l'image par défaut
    const img = event.target as HTMLImageElement;
    img.src = '/assets/default-avatar.png';
  }

  onImageLoad(event: any) {
    console.log('Image loaded successfully:', event.target.src);
  }

  getAvatarUrl(entry: any): string {
    if (!entry?.userAvatarUrl) {
      return '/assets/default-avatar.png';
    }
    
    // Vérifier si l'URL est valide
    try {
      new URL(entry.userAvatarUrl);
      return entry.userAvatarUrl;
    } catch (e) {
      console.log('Invalid avatar URL:', entry.userAvatarUrl);
      return '/assets/default-avatar.png';
    }
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
