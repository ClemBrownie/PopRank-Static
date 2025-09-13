import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText, IonItem, IonLabel, IonTextarea, IonRange, IonModal, IonButtons, IonBackButton, LoadingController, ToastController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { EntriesService } from '../../services/entries.service';
import { AuthService } from '../../services/auth.service';
import { MovieDetails } from '../../models/movie.model';
import { EntryCreate } from '../../models/entry.model';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.page.html',
  styleUrls: ['./movie.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText, IonItem, IonLabel, IonTextarea, IonRange, IonModal, IonButtons, IonBackButton, CommonModule, FormsModule]
})
export class MoviePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tmdbService = inject(TmdbService);
  private entriesService = inject(EntriesService);
  private authService = inject(AuthService);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  movie: MovieDetails | null = null;
  movieId: number | null = null;
  rating = 3;
  review = '';
  isModalOpen = false;

  constructor() { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.movieId = +params['id'];
      if (this.movieId) {
        this.loadMovie();
      }
    });
  }

  async loadMovie() {
    if (!this.movieId) return;

    const loading = await this.loadingController.create({
      message: 'Chargement...'
    });
    await loading.present();

    try {
      this.tmdbService.getMovieDetails(this.movieId).subscribe({
        next: (movie) => {
          this.movie = movie;
          loading.dismiss();
        },
        error: async (error) => {
          console.error('Erreur lors du chargement du film:', error);
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Erreur lors du chargement du film',
            duration: 3000,
            color: 'danger'
          });
          await toast.present();
        }
      });
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Erreur lors du chargement du film',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  openAddEntryModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.rating = 3;
    this.review = '';
  }

  async addEntry() {
    if (!this.movie || !this.movieId) return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const loading = await this.loadingController.create({
      message: 'Ajout en cours...'
    });
    await loading.present();

    try {
      const entryData: EntryCreate = {
        movieId: this.movieId,
        title: this.movie.title,
        posterPath: this.movie.poster_path,
        rating: this.rating,
        review: this.review.trim() || undefined,
        watchedAt: new Date()
      };

      await this.entriesService.addEntry(entryData, user.uid).toPromise();
      
      await loading.dismiss();
      this.closeModal();
      
      const toast = await this.toastController.create({
        message: 'Film ajouté à votre liste !',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Erreur lors de l\'ajout',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  getImageUrl(posterPath: string | null | undefined): string {
    return this.tmdbService.getImageUrl(posterPath, 'w500');
  }

  getBackdropUrl(backdropPath: string | null | undefined): string {
    return this.tmdbService.getBackdropUrl(backdropPath, 'w1280');
  }

  getGenreNames(): string {
    if (!this.movie?.genres) return '';
    return this.movie.genres.map(genre => genre.name).join(', ');
  }
}
