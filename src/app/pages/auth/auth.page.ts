import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, LoadingController, ToastController, IonTextarea, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { logoGoogle, copyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule, FormsModule, IonTextarea, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class AuthPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  debugLogs: string = '';
  showDebugLogs: boolean = false;

  constructor() {
    addIcons({ logoGoogle, copyOutline });
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

    // Réinitialiser les logs de debug
    this.debugLogs = '';
    this.showDebugLogs = false;

    try {
      await this.authService.signInWithGoogle();
      await this.router.navigate(['/tabs/feed']);
      await loading.dismiss();
      
      // Afficher un toast de succès avec logs
      const successToast = await this.toastController.create({
        message: 'Connexion Google réussie !',
        duration: 3000,
        color: 'success'
      });
      await successToast.present();
      
    } catch (error: any) {
      await loading.dismiss();
      
      // Récupérer les logs de debug depuis le service
      const debugLogs = (window as any).lastGoogleAuthDebugLogs || 'Aucun log de debug disponible';
      this.debugLogs = debugLogs;
      this.showDebugLogs = true;
      
      // Créer un message d'erreur détaillé
      const errorMessage = `Erreur de connexion Google:\n\nType: ${error.constructor.name}\nMessage: ${error.message || 'Aucun message'}\nCode: ${error.code || 'Aucun code'}\n\nVoir les logs détaillés ci-dessous pour plus d'informations.`;
      
      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 10000,
        color: 'danger',
        buttons: [
          {
            text: 'Voir les logs',
            handler: () => {
              this.showDebugLogs = true;
            }
          },
          {
            text: 'Fermer',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
      
      console.error('Erreur complète de connexion Google:', error);
    }
  }

  async copyDebugLogs() {
    try {
      await navigator.clipboard.writeText(this.debugLogs);
      const toast = await this.toastController.create({
        message: 'Logs copiés dans le presse-papiers !',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      const toast = await this.toastController.create({
        message: 'Erreur lors de la copie des logs',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  toggleDebugLogs() {
    this.showDebugLogs = !this.showDebugLogs;
  }

  // Méthode pour tester les logs sans faire de vraie connexion
  async testDebugLogs() {
    this.debugLogs = `[${new Date().toISOString()}] === TEST DES LOGS DE DEBUG ===
[${new Date().toISOString()}] Ceci est un test des logs de debug
[${new Date().toISOString()}] Plateforme: ${navigator.platform}
[${new Date().toISOString()}] User Agent: ${navigator.userAgent}
[${new Date().toISOString()}] URL: ${window.location.href}
[${new Date().toISOString()}] Capacitor disponible: ${!!(window as any).Capacitor}
[${new Date().toISOString()}] GoogleAuth disponible: ${!!(window as any).GoogleAuth}
[${new Date().toISOString()}] === FIN DU TEST ===`;
    
    this.showDebugLogs = true;
    
    const toast = await this.toastController.create({
      message: 'Logs de test générés !',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }
}
