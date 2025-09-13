import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { Movie } from '../../models/movie.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonIcon, IonSpinner, CommonModule, FormsModule]
})
export class SearchPage implements OnInit {
  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  
  movies: Movie[] = [];
  loading = false;
  private searchSubject = new Subject<string>();

  constructor() { }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim()) {
          this.loading = true;
          return this.tmdbService.searchMovies(query);
        } else {
          this.movies = [];
          this.loading = false;
          return [];
        }
      })
    ).subscribe({
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

  onSearch(event: any) {
    const query = event.target.value;
    this.searchSubject.next(query);
  }

  goToMovie(movieId: number) {
    this.router.navigate(['/movie', movieId]);
  }

  getImageUrl(posterPath: string | null | undefined): string {
    return this.tmdbService.getImageUrl(posterPath, 'w342');
  }
}
