import axios from 'axios';
import { BACKEND_URL } from '@/constants';
import { CreateRoomRequest, Room } from '@/types/room';
import { Track } from '@/types/spotify';

/**
 * Creates a new room via the backend API
 */
export const createRoom = async (request: CreateRoomRequest): Promise<Room> => {
  const response = await axios.post<Room>(`${BACKEND_URL}/api/v1/rooms/`, request, {
    withCredentials: true,
  });
  return response.data; // backend returns the Room object directly
};

/**
 * Joins an existing room via the backend API
 */
export const joinRoom = async (roomCode: string): Promise<Room> => {
  const response = await axios.get<Room>(`${BACKEND_URL}/api/v1/rooms/code/${roomCode}`, {
    withCredentials: true,
  });
  return response.data;
};

export interface QueueItem {
  id: string;
  track: Track;
  votes: number;
  addedBy: string; // user id or name
}

export interface QueueResponse {
  success: boolean;
  queue: QueueItem[];
}

export const getQueue = async (roomId: string): Promise<QueueItem[]> => {
  const response = await axios.get<QueueItem[]>(`${BACKEND_URL}/api/v1/rooms/${roomId}/queue`, {
    withCredentials: true,
  });
  return response.data;
};

// Modified to accept track details for a more robust payload
export interface AddToQueuePayload {
  track_id: string; // Spotify Track URI
  track_name: string;
  artist: string; // Primary artist name
  //duration_ms?: number; // Optional: if you want to store duration
}

export const addToQueue = async (roomId: string, trackDetails: AddToQueuePayload): Promise<void> => {
  await axios.post(`${BACKEND_URL}/api/v1/rooms/${roomId}/queue`, trackDetails, {
    withCredentials: true,
  });
};

export const voteQueueItem = async (
  roomId: string,
  itemId: string,
  vote: 1 | -1,
): Promise<void> => {
  await axios.post(
    `${BACKEND_URL}/api/v1/rooms/${roomId}/vote`,
    { track_id: itemId, vote },
    { withCredentials: true },
  );
};

export interface Member {
  id: string;
  name: string;
}

export const getMembers = async (roomId: string): Promise<Member[]> => {
  try {
    // Corrected endpoint to fetch members specifically
    const response = await axios.get<{ members: Member[] }>(`${BACKEND_URL}/api/v1/rooms/${roomId}/members`, {
      withCredentials: true,
    });
    // Assuming the backend returns an object like { "members": [...] }
    return response.data.members || [];
  } catch (err:any) {
    if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
      // Endpoint might not be found or room has no members, treat as empty
      console.warn(`getMembers: Room ${roomId} not found or no members endpoint, returning empty array.`);
      return [];
    }
    // Log other errors but still return empty to prevent app crash, error handled in context
    console.error(`Error fetching members for room ${roomId}:`, err);
    throw err; // Re-throw for context to handle
  }
}; 