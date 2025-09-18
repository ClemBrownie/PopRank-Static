import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonAvatar, IonButton, IonIcon, IonTextarea, IonItem, IonLabel, IonText, IonSpinner, IonRefresher, IonRefresherContent, LoadingController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EntriesService } from '../../services/entries.service';
import { TmdbService } from '../../services/tmdb.service';
import { User } from '../../models/user.model';
import { Entry } from '../../models/entry.model';
import { addIcons } from 'ionicons';
import { createOutline, logOutOutline, logOut, informationCircleOutline } from 'ionicons/icons';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonAvatar, IonButton, IonIcon, IonTextarea, IonItem, IonLabel, IonText, IonSpinner, IonRefresher, IonRefresherContent, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private entriesService = inject(EntriesService);
  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  user: User | null = null;
  entries: Entry[] = [];
  loading = true;
  editingBio = false;
  bioText = '';
  appVersion = '1.1.1';

  constructor() {
    addIcons({ createOutline, logOutOutline, logOut, informationCircleOutline });
  }

  async ngOnInit() {
    // Récupérer la version de l'app
    try {
      const info = await App.getInfo();
      this.appVersion = info.version;
    } catch (error) {
      console.log('Impossible de récupérer la version:', error);
      // Garder la version par défaut
    }

    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        console.log('User data:', user);
        console.log('Avatar URL:', user.avatarUrl);
        console.log('Avatar URL type:', typeof user.avatarUrl);
        console.log('Avatar URL length:', user.avatarUrl?.length);
        this.loadMyEntries();
        this.bioText = user.bio || '';
      }
    });
  }

  async loadMyEntries() {
    if (!this.user) return;

    try {
      this.entriesService.getMyEntries(this.user.uid, 50).subscribe({
        next: (entries) => {
          this.entries = entries;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des entrées:', error);
          this.entries = [];
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des entrées:', error);
      this.entries = [];
      this.loading = false;
    }
  }

  async refreshProfile(event: any) {
    await this.loadMyEntries();
    event.target.complete();
  }

  async signOut() {
    const loading = await this.loadingController.create({
      message: 'Déconnexion...'
    });
    await loading.present();

    try {
      await this.authService.signOut();
      await this.router.navigate(['/auth']);
      await loading.dismiss();
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Erreur de déconnexion',
        duration: 30000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  startEditingBio() {
    this.editingBio = true;
  }

  async saveBio() {
    if (!this.user) return;

    const loading = await this.loadingController.create({
      message: 'Sauvegarde...'
    });
    await loading.present();

    try {
      await this.authService.updateUserProfile({ bio: this.bioText });
      this.editingBio = false;
      await loading.dismiss();
      
      const toast = await this.toastController.create({
        message: 'Bio mise à jour !',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Erreur lors de la sauvegarde',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  cancelEditingBio() {
    this.editingBio = false;
    this.bioText = this.user?.bio || '';
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

  getAverageRating(): number {
    if (this.entries.length === 0) return 0;
    const sum = this.entries.reduce((acc, entry) => acc + entry.rating, 0);
    return sum / this.entries.length;
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

  getAvatarUrl(): string {
    if (!this.user?.avatarUrl) {
      return '/assets/default-avatar.png';
    }
    
    // Vérifier si l'URL est valide
    try {
      new URL(this.user.avatarUrl);
      return this.user.avatarUrl;
    } catch (e) {
      console.log('Invalid avatar URL:', this.user.avatarUrl);
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

  formatJoinDate(timestamp: any): string {
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

    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  }
}
