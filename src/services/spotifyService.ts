import { BACKEND_URL } from "@/constants";
import { Track, Artist as SpotifyArtist, UserProfile } from "@/types/spotify";
import axios from "axios";

// Flag to control fallback to direct API calls when backend endpoints aren't available
// Set to true during development/while backend catches up
const USE_FALLBACK_DIRECT_CALLS = true;
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

// Helper for direct Spotify API calls (fallback mode)
const spotifyApiDirect = axios.create({
  baseURL: SPOTIFY_API_BASE_URL,
});

// Helper to set auth header for direct calls
const setDirectSpotifyAuthHeader = (token: string) => {
  spotifyApiDirect.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Checks if a backend endpoint exists, returns true if it responds with 2xx or 3xx
// Used to auto-detect if we need fallback mode for specific endpoints
async function checkEndpointExists(endpoint: string): Promise<boolean> {
  try {
    await axios.options(`${BACKEND_URL}${endpoint}`, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // If we get any response from server, the endpoint exists
      // but we might not have permission (401/403) - that's fine
      return error.response.status < 404;
    }
    return false;
  }
}

// --- Functions calling YOUR BACKEND --- 

/**
 * Fetches user profile from YOUR BACKEND, which then calls Spotify
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
      withCredentials: true // For your backend to use cookies/session
    });
    if (response.status !== 200) {
      throw new Error(`Error fetching user profile from backend: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error("Service: Error fetching user profile from backend:", error);
    throw error;
  }
};

/**
 * Fetches user's top artists from YOUR BACKEND, which then calls Spotify
 */
export const getTopArtists = async (limit: number = 5): Promise<SpotifyArtist[]> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/auth/me/top-artists`, {
      params: { limit, time_range: 'medium_term' }, // Your backend can pass these to Spotify
      withCredentials: true
    });
    if (response.status !== 200) {
      throw new Error(`Error fetching top artists from backend: ${response.status}`);
    }
    // Assuming your backend returns the items array directly or an object containing items
    return response.data.items || response.data;
  } catch (error) {
    console.error("Service: Error fetching top artists from backend:", error);
    throw error;
  }
};

/**
 * Fetches the user's top tracks from YOUR BACKEND
 */
export const getTopTracks = async (
  limit: number = 20,
  offset: number = 0,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
): Promise<Track[]> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/auth/me/top-tracks`, {
      params: { limit, offset, time_range: timeRange },
      withCredentials: true
    });
    if (response.status !== 200) {
      throw new Error(`Error fetching top tracks from backend: ${response.status}`);
    }
    return response.data.items || response.data;
  } catch (error) {
    console.error("Failed to fetch top tracks from backend:", error);
    throw error;
  }
};

/**
 * Tells YOUR BACKEND to start/resume playback of a specific track
 */
export const playTrackViaBackend = async (trackUri: string, deviceId?: string, token?: string): Promise<void> => {
  try {
    // First try backend endpoint
    if (!USE_FALLBACK_DIRECT_CALLS) {
      const response = await axios.post(`${BACKEND_URL}/api/v1/me/player/play`, 
        { 
          trackUri: trackUri, 
          deviceId: deviceId 
        },
        {
          withCredentials: true
        }
      );
      
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Error playing track via backend: ${response.status} ${response.statusText}`);
      }
      console.log("Service: Successfully requested backend to play track:", trackUri);
      return;
    }
    
    // Fallback: Direct Spotify API call if token is provided
    if (token) {
      console.log("Service: Using fallback - playing track directly via Spotify API");
      try {
        setDirectSpotifyAuthHeader(token);
        
        const data: any = { uris: [trackUri] };
        let url = `${SPOTIFY_API_BASE_URL}/me/player/play`;
        
        if (deviceId) {
          url += `?device_id=${deviceId}`;
        }
        
        await spotifyApiDirect.put(url, data);
        console.log("Service: Successfully played track:", trackUri);
        return;
      } catch (fallbackErr: any) {
        // Special handling for common Spotify errors
        if (fallbackErr.response) {
          if (fallbackErr.response.status === 403) {
            throw new Error("Premium account required for playback control");
          } else if (fallbackErr.response.status === 404) {
            throw new Error("No active device found");
          }
        }
        throw fallbackErr;
      }
    }
    
    throw new Error("Cannot play track - backend endpoint not available and no token provided");
  } catch (error) {
    console.error("Service: Error playing track:", error);
    throw error; // Still throw here as UI needs to know about playback errors
  }
};

/**
 * Pauses playback via backend
 */
export const pausePlaybackViaBackend = async (deviceId?: string): Promise<void> => {
  try {
    const response = await axios.put(`${BACKEND_URL}/api/v1/me/player/pause`, 
      { deviceId },
      { withCredentials: true }
    );
    
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Error pausing playback via backend: ${response.status} ${response.statusText}`);
    }
    console.log("Service: Successfully requested backend to pause playback");
  } catch (error) {
    console.error("Service: Error pausing playback via backend:", error);
    throw error;
  }
};

/**
 * Skips to the next track via backend
 */
export const skipToNextTrackViaBackend = async (deviceId?: string): Promise<void> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/v1/me/player/next`, 
      { deviceId },
      { withCredentials: true }
    );
    
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Error skipping to next track via backend: ${response.status} ${response.statusText}`);
    }
    console.log("Service: Successfully requested backend to skip to next track");
  } catch (error) {
    console.error("Service: Error skipping to next track via backend:", error);
    throw error;
  }
};

/**
 * Skips to the previous track via backend
 */
export const skipToPreviousTrackViaBackend = async (deviceId?: string): Promise<void> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/v1/me/player/previous`, 
      { deviceId },
      { withCredentials: true }
    );
    
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Error skipping to previous track via backend: ${response.status} ${response.statusText}`);
    }
    console.log("Service: Successfully requested backend to skip to previous track");
  } catch (error) {
    console.error("Service: Error skipping to previous track via backend:", error);
    throw error;
  }
};

/**
 * Transfers playback to a device via backend
 */
export const transferPlaybackViaBackend = async (deviceId: string, token?: string): Promise<void> => {
  try {
    // First try backend endpoint
    if (!USE_FALLBACK_DIRECT_CALLS) {
      const response = await axios.put(`${BACKEND_URL}/api/v1/me/player`, 
        { 
          deviceIds: [deviceId],
          play: false 
        },
        { withCredentials: true }
      );
      
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Error transferring playback via backend: ${response.status} ${response.statusText}`);
      }
      console.log("Service: Successfully requested backend to transfer playback to device:", deviceId);
      return;
    }
    
    // For transferring playback, we can use fallback since the streaming token can do this
    if (token) {
      console.log("Service: Using fallback - transferring playback directly via Spotify API");
      try {
        setDirectSpotifyAuthHeader(token);
        await spotifyApiDirect.put('/me/player', {
          device_ids: [deviceId],
          play: false
        });
        console.log("Service: Successfully transferred playback to device:", deviceId);
        return;
      } catch (fallbackErr) {
        // Handle potential scope issues
        console.warn("Service: Fallback failed for transferring playback, this may be a scope permission issue");
        // Don't throw here, app can continue without transfer
        return;
      }
    }
    
    // Silently fail for development
    console.warn("Service: Cannot transfer playback - backend endpoint not available and no token provided");
    // Don't throw during development to allow app to continue
    return; 
  } catch (error) {
    console.error("Service: Error transferring playback:", error);
    // Don't throw during development to allow app to continue
  }
};

/**
 * Searches for tracks via backend
 */
export const searchTracksViaBackend = async (query: string, limit: number = 10): Promise<any> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/search/tracks`, {
      params: { q: query, limit },
      withCredentials: true
    });
    
    if (response.status !== 200) {
      throw new Error(`Error searching tracks via backend: ${response.status} ${response.statusText}`);
    }
    return response.data.items || response.data;
  } catch (error) {
    console.error("Service: Error searching tracks via backend:", error);
    throw error;
  }
};

// For backwards compatibility, maintain the old function names
// but they now call the backend-proxied versions
export const pausePlaybackApi = async (_token: string, deviceId?: string): Promise<void> => {
  await pausePlaybackViaBackend(deviceId);
};

export const skipToNextTrackApi = async (_token: string, deviceId?: string): Promise<void> => {
  await skipToNextTrackViaBackend(deviceId);
};

export const skipToPreviousTrackApi = async (_token: string, deviceId?: string): Promise<void> => {
  await skipToPreviousTrackViaBackend(deviceId);
};

export const searchTracks = async (_token: string, query: string): Promise<any> => {
  return searchTracksViaBackend(query);
};

// Function to format duration from ms to mm:ss
export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Fetches the current player state from the backend
 */
export const getPlayerState = async (token?: string): Promise<any> => {
  try {
    // First try backend endpoint
    if (!USE_FALLBACK_DIRECT_CALLS) {
      const response = await axios.get(`${BACKEND_URL}/api/v1/me/player/state`, {
        withCredentials: true
      });
      
      if (response.status !== 200) {
        throw new Error(`Error fetching player state: ${response.status}`);
      }
      
      return response.data;
    }
    
    // IMPORTANT: We can't fall back to direct API calls for player state
    // The streaming token doesn't have the 'user-read-playback-state' scope
    // Skip fallback attempts and return null to avoid 401 errors
    console.log("Service: Skipping fallback for player state - streaming token doesn't have required scopes");
    return null;
    
    /* Fallback disabled for player state - streaming tokens don't have required scope
    if (token) {
      console.log("Service: Using fallback - fetching player state directly via Spotify API");
      setDirectSpotifyAuthHeader(token);
      const response = await spotifyApiDirect.get('/me/player');
      return response.data;
    }
    */
    
    // If we reach this point, we can't get the player state
    console.warn("Service: Cannot fetch player state - backend endpoint not available");
    return null;
  } catch (error) {
    console.error("Service: Error fetching player state:", error);
    // Don't throw here - just return null so the app can continue if state restoration fails
    return null;
  }
}; 