import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, LoadingController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule, FormsModule]
})
export class AuthPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ logoGoogle });
  }

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
        duration: 30000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
