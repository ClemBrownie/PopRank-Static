import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User, UserCreate } from '../models/user.model';

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
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return this.getOrCreateUser(result.user);
    } catch (error: any) {
      console.error('Erreur de connexion Google:', error);
      throw new Error('Échec de la connexion Google. Veuillez réessayer.');
    }
  }

  async signOut(): Promise<void> {
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
