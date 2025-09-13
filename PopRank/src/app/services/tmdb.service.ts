import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Movie, MovieSearchResult, MovieDetails } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdb.baseUrl;
  private apiKey = environment.tmdb.apiKey;

  searchMovies(query: string, page: number = 1): Observable<MovieSearchResult> {
    if (!query.trim()) {
      return new Observable(observer => {
        observer.next({ page: 1, results: [], total_pages: 0, total_results: 0 });
        observer.complete();
      });
    }

    const url = `${this.baseUrl}/search/movie`;
    const params = {
      api_key: this.apiKey,
      query: query.trim(),
      page: page.toString(),
      language: 'fr-FR'
    };
    
    return this.http.get<MovieSearchResult>(url, { params });
  }

  getMovieDetails(movieId: number): Observable<MovieDetails> {
    const url = `${this.baseUrl}/movie/${movieId}`;
    const params = {
      api_key: this.apiKey,
      language: 'fr-FR'
    };
    
    return this.http.get<MovieDetails>(url, { params });
  }

  getImageUrl(posterPath: string | null | undefined, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!posterPath) return '/assets/no-poster.png';
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }

  getBackdropUrl(backdropPath: string | null | undefined, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!backdropPath) return '/assets/no-backdrop.png';
    return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
  }
}
