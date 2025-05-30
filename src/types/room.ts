export interface Room {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  currentTrack?: string; // Spotify URI of current track
}

export interface RoomResponse {
  success: boolean;
  message?: string;
  room?: Room;
}

export interface CreateRoomRequest {
  name: string;
  isPrivate: boolean;
} 