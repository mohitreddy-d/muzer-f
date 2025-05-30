import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { Track as SpotifyTrackType } from '@/types/spotify'; // Assuming this is your detailed track type

// Define the shape of the player state
export interface PlayerState {
  player: any; // Spotify.Player instance (consider a more specific type if possible)
  deviceId: string | null;
  isActive: boolean;
  isPaused: boolean;
  currentTrack: SpotifyTrackType | null;
  progressMs: number;
  volume: number; // 0-100
  // Add other relevant states like shuffle, repeat if managed here
}

// Define the shape of the context value
interface PlayerContextType extends PlayerState {
  setPlayerState: Dispatch<SetStateAction<PlayerState>>; // Single setter for the whole state object
  // Playback control functions to be implemented in the provider
  playTrack: (trackUri: string, deviceIdOverride?: string) => Promise<void>;
  togglePlay: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  setPlayerVolume: (volume: number) => void; // Volume for SDK (0-1)
  pauseCurrentTrack: () => Promise<void>; // New function
}

const defaultTrackContext: SpotifyTrackType = {
  id: "", name: "Not Playing", artists: [], duration_ms: 0, album: { id: "", name: "", images: [] }, uri: ""
};

// Create the context with a default value
export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Custom hook to use the PlayerContext
export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

// PlayerProvider component (to be fleshed out in App.tsx or a layout component)
// For now, this is just a placeholder to show the structure.
// The actual SDK initialization and state management will move to where this Provider is used.
export const PlayerProviderPlaceholder: React.FC<{children: ReactNode}> = ({ children }) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    player: null,
    deviceId: null,
    isActive: false,
    isPaused: true,
    currentTrack: defaultTrackContext,
    progressMs: 0,
    volume: 50,
  });

  // Placeholder functions - these will be implemented with Spotify SDK logic
  const playTrack = async (trackUri: string) => { console.warn("playTrack not implemented", trackUri); };
  const togglePlay = () => { console.warn("togglePlay not implemented"); };
  const skipToNext = () => { console.warn("skipToNext not implemented"); };
  const skipToPrevious = () => { console.warn("skipToPrevious not implemented"); };
  const setPlayerVolume = (volume: number) => { console.warn("setPlayerVolume not implemented", volume); };
  const pauseCurrentTrack = async () => { console.warn("pauseCurrentTrack not implemented"); }; // New placeholder
  
  return (
    <PlayerContext.Provider value={{
      ...playerState,
      setPlayerState, // Pass the single state setter
      playTrack,
      togglePlay,
      skipToNext,
      skipToPrevious,
      setPlayerVolume,
      pauseCurrentTrack // Add to context value
    }}>
      {children}
    </PlayerContext.Provider>
  );
}; 