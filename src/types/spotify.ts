export interface Artist {
  id: string;
  name: string;
  genres?: string[];
  images?: { url: string }[];
}

export interface Album {
  id: string;
  name: string;
  images: {
    url: string;
    height?: number;
    width?: number;
  }[];
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  duration_ms: number;
  album: Album;
  uri?: string;
}

export interface UserProfile {
  display_name: string;
  email?: string;
  followers: { total: number };
  images: { url: string; height?: number; width?: number }[];
  country?: string;
  product?: string;
  id: string;
} 