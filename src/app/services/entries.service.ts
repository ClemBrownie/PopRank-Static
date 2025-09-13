import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Entry, EntryCreate } from '../models/entry.model';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  private firestore = inject(Firestore);

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
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Entry))
      )
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
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Entry))
      )
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
}
