import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, LoadingController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, CommonModule, FormsModule]
})
export class AuthPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  constructor() { }

  ngOnInit() {
    // Vérifier si l'utilisateur est déjà connecté
    this.authService.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/tabs/feed']);
      }
    });
  }

  async signInWithGoogle() {
    const loading = await this.loadingController.create({
      message: 'Connexion en cours...'
    });
    await loading.present();

    try {
      await this.authService.signInWithGoogle();
      await this.router.navigate(['/tabs/feed']);
      await loading.dismiss();
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Erreur de connexion',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
