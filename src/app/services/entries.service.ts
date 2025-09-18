import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, limit, getDocs, doc, updateDoc, deleteDoc, getDoc, writeBatch } from '@angular/fire/firestore';
import { Observable, from, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Entry, EntryCreate } from '../models/entry.model';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  private firestore = inject(Firestore);
  private userCache = new Map<string, { displayName: string; avatarUrl: string | undefined }>();

  addEntry(entryData: EntryCreate, uid: string): Observable<string> {
    const entriesRef = collection(this.firestore, 'entries');
    const entry = {
      ...entryData,
      uid,
      createdAt: new Date()
    };
    
    return from(addDoc(entriesRef, entry)).pipe(
      map(docRef => docRef.id)
    );
  }

  getMyEntries(uid: string, limitCount: number = 50): Observable<Entry[]> {
    const entriesRef = collection(this.firestore, 'entries');
    const q = query(
      entriesRef,
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return from(getDocs(q)).pipe(
      switchMap(snapshot => {
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Entry));

        // Vérifier le cache d'abord
        if (this.userCache.has(uid)) {
          const cached = this.userCache.get(uid)!;
          return from(Promise.resolve(entries.map(entry => ({
            ...entry,
            userDisplayName: cached.displayName,
            userAvatarUrl: cached.avatarUrl
          }))));
        }

        // Sinon, récupérer depuis Firestore
        return from(getDoc(doc(this.firestore, 'users', uid))).pipe(
          map(userDoc => {
            let userData = { displayName: 'Utilisateur', avatarUrl: undefined };
            if (userDoc.exists()) {
              const data = userDoc.data();
              userData = {
                displayName: data['displayName'],
                avatarUrl: data['avatarUrl']
              };
            }

            // Mettre en cache
            this.userCache.set(uid, userData);

            // Enrichir les entrées avec les informations utilisateur
            return entries.map(entry => ({
              ...entry,
              userDisplayName: userData.displayName,
              userAvatarUrl: userData.avatarUrl
            }));
          })
        );
      })
    );
  }

  getFeedEntries(limitCount: number = 50): Observable<Entry[]> {
    const entriesRef = collection(this.firestore, 'entries');
    const q = query(
      entriesRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return from(getDocs(q)).pipe(
      switchMap(snapshot => {
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Entry));

        // Récupérer tous les UIDs uniques
        const uniqueUids = [...new Set(entries.map(entry => entry.uid))];
        
        // Récupérer toutes les informations utilisateur en une seule fois
        const userPromises = uniqueUids.map(uid => {
          // Vérifier le cache d'abord
          if (this.userCache.has(uid)) {
            const cached = this.userCache.get(uid)!;
            return Promise.resolve({
              uid,
              displayName: cached.displayName,
              avatarUrl: cached.avatarUrl
            });
          }

          // Sinon, récupérer depuis Firestore
          return getDoc(doc(this.firestore, 'users', uid)).then(userDoc => {
            let userData = { displayName: 'Utilisateur', avatarUrl: undefined };
            if (userDoc.exists()) {
              const data = userDoc.data();
              userData = {
                displayName: data['displayName'],
                avatarUrl: data['avatarUrl']
              };
            }
            
            // Mettre en cache
            this.userCache.set(uid, userData);
            
            return {
              uid,
              displayName: userData.displayName,
              avatarUrl: userData.avatarUrl || undefined
            };
          });
        });

        return from(Promise.all(userPromises)).pipe(
          map(users => {
            // Créer un map des utilisateurs pour un accès rapide
            const userMap = new Map(users.map(user => [user.uid, user]));
            
            // Enrichir les entrées avec les informations utilisateur
            return entries.map(entry => {
              const user = userMap.get(entry.uid);
              return {
                ...entry,
                userDisplayName: user?.displayName || 'Utilisateur',
                userAvatarUrl: user?.avatarUrl || undefined
              };
            });
          })
        );
      })
    );
  }

  updateEntry(entryId: string, updates: Partial<EntryCreate>): Observable<void> {
    const entryRef = doc(this.firestore, 'entries', entryId);
    return from(updateDoc(entryRef, updates));
  }

  deleteEntry(entryId: string): Observable<void> {
    const entryRef = doc(this.firestore, 'entries', entryId);
    return from(deleteDoc(entryRef));
  }

  // Méthode pour vider le cache utilisateur si nécessaire
  clearUserCache(): void {
    this.userCache.clear();
  }

  // Méthode pour vider le cache d'un utilisateur spécifique
  clearUserCacheForUid(uid: string): void {
    this.userCache.delete(uid);
  }
}
