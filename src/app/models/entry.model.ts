export interface Entry {
  id: string;
  uid: string;
  movieId: number;
  title: string;
  posterPath?: string;
  rating: number; // 0-5
  review?: string;
  watchedAt: Date;
  createdAt: Date;
}

export interface EntryCreate {
  movieId: number;
  title: string;
  posterPath?: string;
  rating: number;
  review?: string;
  watchedAt: Date;
}
