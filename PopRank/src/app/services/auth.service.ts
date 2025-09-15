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
    try {
      if (Capacitor.isNativePlatform()) {
        // Utiliser le plugin Capacitor pour mobile
        console.log('Tentative de connexion Google sur mobile...');
        const result = await GoogleAuth.signIn();
        console.log('Résultat Google Auth:', result);
        
        if (!result.authentication?.idToken) {
          throw new Error('Aucun token d\'authentification reçu de Google');
        }
        
        const credential = GoogleAuthProvider.credential(result.authentication.idToken);
        const firebaseResult = await signInWithCredential(this.auth, credential);
        console.log('Connexion Firebase réussie:', firebaseResult.user.uid);
        return this.getOrCreateUser(firebaseResult.user);
      } else {
        // Utiliser signInWithPopup pour le web
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(this.auth, provider);
        return this.getOrCreateUser(result.user);
      }
    } catch (error: any) {
      console.error('Erreur de connexion Google:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
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
