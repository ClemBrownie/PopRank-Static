import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSearchbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonIcon, IonSpinner, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { Movie } from '../../models/movie.model';
import { addIcons } from 'ionicons';
import { search, refresh } from 'ionicons/icons';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonContent, IonSearchbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonIcon, IonSpinner, IonButton, CommonModule, FormsModule]
})
export class SearchPage implements OnInit {
  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  
  movies: Movie[] = [];
  loading = false;
  searchQuery = '';
  hasSearched = false;

  constructor() {
    addIcons({ search, refresh });
  }

  ngOnInit() {
    // Plus besoin de la recherche automatique
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.hasSearched = true;
      this.loading = true;
      this.tmdbService.searchMovies(this.searchQuery.trim()).subscribe({
        next: (result) => {
          this.movies = result.results || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur de recherche:', error);
          this.movies = [];
          this.loading = false;
        }
      });
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.movies = [];
    this.hasSearched = false;
  }

  goToMovie(movieId: number) {
    this.router.navigate(['/movie', movieId]);
  }

  getImageUrl(posterPath: string | null | undefined): string {
    return this.tmdbService.getImageUrl(posterPath, 'w342');
  }
}
