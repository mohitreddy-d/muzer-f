import axios from 'axios';
import { BACKEND_URL } from '@/constants';
import { Track } from '@/types/spotify';

export const searchTracks = async (query: string, limit: number = 20): Promise<Track[]> => {
  const response = await axios.get<Track[]>(`${BACKEND_URL}/api/v1/search/tracks`, {
    params: { q: query, limit },
    withCredentials: true,
  });
  return response.data;
}; 