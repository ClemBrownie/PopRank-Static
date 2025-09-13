import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonImg, IonAvatar, IonSpinner, IonRefresher, IonRefresherContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { EntriesService } from '../../services/entries.service';
import { TmdbService } from '../../services/tmdb.service';
import { Entry } from '../../models/entry.model';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonImg, IonAvatar, IonSpinner, IonRefresher, IonRefresherContent, IonIcon, CommonModule, FormsModule]
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
}
