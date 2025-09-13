export interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface MovieSearchResult {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  status: string;
  tagline?: string;
}
