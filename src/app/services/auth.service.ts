import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User, UserCreate } from '../models/user.model';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.getOrCreateUser(firebaseUser);
        this.userSubject.next(user);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  async signInWithGoogle(): Promise<User> {
    const debugInfo: string[] = [];
    const timestamp = new Date().toISOString();
    
    try {
      debugInfo.push(`[${timestamp}] === DÉBUT CONNEXION GOOGLE ===`);
      debugInfo.push(`[${timestamp}] Plateforme détectée: ${Capacitor.isNativePlatform() ? 'Mobile' : 'Web'}`);
      debugInfo.push(`[${timestamp}] Capacitor version: ${Capacitor.getPlatform()}`);
      debugInfo.push(`[${timestamp}] User Agent: ${navigator.userAgent}`);
      debugInfo.push(`[${timestamp}] URL actuelle: ${window.location.href}`);
      
      // Vérifications de configuration
      debugInfo.push(`[${timestamp}] === VÉRIFICATIONS DE CONFIGURATION ===`);
      debugInfo.push(`[${timestamp}] Firebase Auth disponible: ${!!this.auth}`);
      debugInfo.push(`[${timestamp}] Firestore disponible: ${!!this.firestore}`);
      
      if (Capacitor.isNativePlatform()) {
        debugInfo.push(`[${timestamp}] GoogleAuth plugin disponible: ${!!GoogleAuth}`);
        debugInfo.push(`[${timestamp}] GoogleAuth.signIn disponible: ${typeof GoogleAuth.signIn === 'function'}`);
        
        // Vérifier la configuration Google Auth
        try {
          const config = await (GoogleAuth as any).getConfig?.();
          debugInfo.push(`[${timestamp}] Configuration Google Auth: ${JSON.stringify(config, null, 2)}`);
        } catch (configError) {
          debugInfo.push(`[${timestamp}] Erreur lors de la récupération de la config: ${configError}`);
        }
        // Utiliser le plugin Capacitor pour mobile
        debugInfo.push(`[${timestamp}] Tentative de connexion Google sur mobile...`);
        console.log('Tentative de connexion Google sur mobile...');
        
        // Vérifier si GoogleAuth est initialisé
        debugInfo.push(`[${timestamp}] Vérification de l'initialisation GoogleAuth...`);
        
        const result = await GoogleAuth.signIn();
        debugInfo.push(`[${timestamp}] Résultat Google Auth reçu: ${JSON.stringify(result, null, 2)}`);
        console.log('Résultat Google Auth:', result);
        
        // Vérifications spécifiques pour Android/Google Play Store
        debugInfo.push(`[${timestamp}] === VÉRIFICATIONS SPÉCIFIQUES ANDROID ===`);
        debugInfo.push(`[${timestamp}] Résultat null: ${result === null}`);
        debugInfo.push(`[${timestamp}] Résultat undefined: ${result === undefined}`);
        debugInfo.push(`[${timestamp}] Type du résultat: ${typeof result}`);
        debugInfo.push(`[${timestamp}] Clés du résultat: ${result ? Object.keys(result) : 'N/A'}`);
        
        if (result && result.authentication) {
          debugInfo.push(`[${timestamp}] Clés de authentication: ${Object.keys(result.authentication)}`);
          debugInfo.push(`[${timestamp}] ID Token présent: ${!!result.authentication.idToken}`);
          debugInfo.push(`[${timestamp}] Access Token présent: ${!!result.authentication.accessToken}`);
          debugInfo.push(`[${timestamp}] Refresh Token présent: ${!!result.authentication.refreshToken}`);
        }
        
        if (!result) {
          throw new Error('Aucun résultat reçu de GoogleAuth.signIn()');
        }
        
        if (!result.authentication) {
          throw new Error('Aucun objet authentication dans le résultat Google Auth');
        }
        
        if (!result.authentication.idToken) {
          throw new Error('Aucun token d\'authentification reçu de Google');
        }
        
        debugInfo.push(`[${timestamp}] Token ID reçu: ${result.authentication.idToken.substring(0, 50)}...`);
        debugInfo.push(`[${timestamp}] Access Token: ${result.authentication.accessToken ? 'Présent' : 'Absent'}`);
        debugInfo.push(`[${timestamp}] Refresh Token: ${result.authentication.refreshToken ? 'Présent' : 'Absent'}`);
        
        const credential = GoogleAuthProvider.credential(result.authentication.idToken);
        debugInfo.push(`[${timestamp}] Credential Google créée avec succès`);
        
        const firebaseResult = await signInWithCredential(this.auth, credential);
        debugInfo.push(`[${timestamp}] Connexion Firebase réussie: ${firebaseResult.user.uid}`);
        debugInfo.push(`[${timestamp}] Email utilisateur: ${firebaseResult.user.email}`);
        debugInfo.push(`[${timestamp}] Nom d'affichage: ${firebaseResult.user.displayName}`);
        debugInfo.push(`[${timestamp}] Photo de profil: ${firebaseResult.user.photoURL ? 'Présente' : 'Absente'}`);
        debugInfo.push(`[${timestamp}] Email vérifié: ${firebaseResult.user.emailVerified}`);
        debugInfo.push(`[${timestamp}] Provider data: ${JSON.stringify(firebaseResult.user.providerData, null, 2)}`);
        debugInfo.push(`[${timestamp}] Métadonnées: ${JSON.stringify(firebaseResult.user.metadata, null, 2)}`);
        console.log('Connexion Firebase réussie:', firebaseResult.user.uid);
        
        const user = await this.getOrCreateUser(firebaseResult.user);
        debugInfo.push(`[${timestamp}] Utilisateur créé/récupéré avec succès: ${user.uid}`);
        debugInfo.push(`[${timestamp}] === CONNEXION GOOGLE RÉUSSIE ===`);
        
        return user;
      } else {
        // Utiliser signInWithPopup pour le web
        debugInfo.push(`[${timestamp}] Utilisation de signInWithPopup pour le web`);
        const provider = new GoogleAuthProvider();
        debugInfo.push(`[${timestamp}] Provider Google créé`);
        
        const result = await signInWithPopup(this.auth, provider);
        debugInfo.push(`[${timestamp}] Popup de connexion fermée avec succès`);
        debugInfo.push(`[${timestamp}] UID utilisateur: ${result.user.uid}`);
        debugInfo.push(`[${timestamp}] Email: ${result.user.email}`);
        
        const user = await this.getOrCreateUser(result.user);
        debugInfo.push(`[${timestamp}] Utilisateur créé/récupéré avec succès: ${user.uid}`);
        debugInfo.push(`[${timestamp}] === CONNEXION GOOGLE RÉUSSIE ===`);
        
        return user;
      }
    } catch (error: any) {
      debugInfo.push(`[${timestamp}] === ERREUR LORS DE LA CONNEXION ===`);
      debugInfo.push(`[${timestamp}] Type d'erreur: ${error.constructor.name}`);
      debugInfo.push(`[${timestamp}] Message d'erreur: ${error.message || 'Aucun message'}`);
      debugInfo.push(`[${timestamp}] Code d'erreur: ${error.code || 'Aucun code'}`);
      debugInfo.push(`[${timestamp}] Stack trace: ${error.stack || 'Aucune stack trace'}`);
      debugInfo.push(`[${timestamp}] Erreur complète: ${JSON.stringify(error, null, 2)}`);
      
      // Logs spécifiques pour les erreurs courantes Google Play Store
      debugInfo.push(`[${timestamp}] === DIAGNOSTIC ERREURS GOOGLE PLAY STORE ===`);
      
      if (error.code) {
        switch (error.code) {
          case 'auth/account-exists-with-different-credential':
            debugInfo.push(`[${timestamp}] ERREUR: Un compte existe déjà avec un autre provider`);
            break;
          case 'auth/invalid-credential':
            debugInfo.push(`[${timestamp}] ERREUR: Credential invalide - vérifiez la configuration OAuth`);
            break;
          case 'auth/operation-not-allowed':
            debugInfo.push(`[${timestamp}] ERREUR: Provider Google non activé dans Firebase Console`);
            break;
          case 'auth/user-disabled':
            debugInfo.push(`[${timestamp}] ERREUR: Compte utilisateur désactivé`);
            break;
          case 'auth/user-not-found':
            debugInfo.push(`[${timestamp}] ERREUR: Utilisateur non trouvé`);
            break;
          case 'auth/wrong-password':
            debugInfo.push(`[${timestamp}] ERREUR: Mot de passe incorrect`);
            break;
          case 'auth/invalid-verification-code':
            debugInfo.push(`[${timestamp}] ERREUR: Code de vérification invalide`);
            break;
          case 'auth/invalid-verification-id':
            debugInfo.push(`[${timestamp}] ERREUR: ID de vérification invalide`);
            break;
          case 'auth/missing-verification-code':
            debugInfo.push(`[${timestamp}] ERREUR: Code de vérification manquant`);
            break;
          case 'auth/missing-verification-id':
            debugInfo.push(`[${timestamp}] ERREUR: ID de vérification manquant`);
            break;
          case 'auth/code-expired':
            debugInfo.push(`[${timestamp}] ERREUR: Code expiré`);
            break;
          case 'auth/invalid-phone-number':
            debugInfo.push(`[${timestamp}] ERREUR: Numéro de téléphone invalide`);
            break;
          case 'auth/missing-phone-number':
            debugInfo.push(`[${timestamp}] ERREUR: Numéro de téléphone manquant`);
            break;
          case 'auth/quota-exceeded':
            debugInfo.push(`[${timestamp}] ERREUR: Quota dépassé`);
            break;
          case 'auth/captcha-check-failed':
            debugInfo.push(`[${timestamp}] ERREUR: Échec de la vérification CAPTCHA`);
            break;
          case 'auth/invalid-app-credential':
            debugInfo.push(`[${timestamp}] ERREUR: Credential d'application invalide`);
            break;
          case 'auth/invalid-app-id':
            debugInfo.push(`[${timestamp}] ERREUR: ID d'application invalide`);
            break;
          case 'auth/missing-app-credential':
            debugInfo.push(`[${timestamp}] ERREUR: Credential d'application manquant`);
            break;
          case 'auth/invalid-user-token':
            debugInfo.push(`[${timestamp}] ERREUR: Token utilisateur invalide`);
            break;
          case 'auth/user-token-expired':
            debugInfo.push(`[${timestamp}] ERREUR: Token utilisateur expiré`);
            break;
          case 'auth/network-request-failed':
            debugInfo.push(`[${timestamp}] ERREUR: Échec de la requête réseau`);
            break;
          case 'auth/too-many-requests':
            debugInfo.push(`[${timestamp}] ERREUR: Trop de requêtes - temporairement bloqué`);
            break;
          case 'auth/requires-recent-login':
            debugInfo.push(`[${timestamp}] ERREUR: Connexion récente requise`);
            break;
          default:
            debugInfo.push(`[${timestamp}] ERREUR INCONNUE: ${error.code}`);
        }
      }
      
      // Vérifications spécifiques pour Google Play Store
      if (Capacitor.isNativePlatform()) {
        debugInfo.push(`[${timestamp}] === VÉRIFICATIONS GOOGLE PLAY STORE ===`);
        debugInfo.push(`[${timestamp}] Package name: ${(window as any).Capacitor?.getPlatform() === 'android' ? 'Vérifiez dans build.gradle' : 'N/A'}`);
        debugInfo.push(`[${timestamp}] SHA-1 fingerprint: Vérifiez dans Google Play Console`);
        debugInfo.push(`[${timestamp}] Google Services JSON: Vérifiez la configuration`);
        debugInfo.push(`[${timestamp}] OAuth Client ID: Vérifiez dans Google Cloud Console`);
      }
      
      console.error('Erreur de connexion Google:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Stocker les logs de debug pour les afficher dans l'UI
      (window as any).lastGoogleAuthDebugLogs = debugInfo.join('\n');
      
      throw new Error(`Échec de la connexion Google: ${error.message || 'Erreur inconnue'}`);
    }
  }

  async signOut(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await GoogleAuth.signOut();
    }
    await signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  private async getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
    const userDoc = doc(this.firestore, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userDoc);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: firebaseUser.uid,
        displayName: data['displayName'],
        avatarUrl: data['avatarUrl'],
        bio: data['bio'],
        createdAt: data['createdAt'].toDate()
      };
    } else {
      // Créer un nouvel utilisateur
      const newUser: User = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Utilisateur',
        avatarUrl: firebaseUser.photoURL || undefined,
        bio: '',
        createdAt: new Date()
      };

      await setDoc(userDoc, {
        displayName: newUser.displayName,
        avatarUrl: newUser.avatarUrl,
        bio: newUser.bio,
        createdAt: newUser.createdAt
      });

      return newUser;
    }
  }

  async updateUserProfile(updates: Partial<UserCreate>): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Utilisateur non connecté');

    const userDoc = doc(this.firestore, 'users', currentUser.uid);
    await setDoc(userDoc, updates, { merge: true });

    // Mettre à jour l'état local
    const updatedUser = { ...currentUser, ...updates };
    this.userSubject.next(updatedUser);
  }
}
