// import { Toaster } from "@/components/ui/toaster";
import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Home from "@/pages/Home";
import { BACKEND_URL } from '@/constants';
import axios from 'axios';
import WebPlayback from '@/components/WebPlayback';
import ProfilePage from "@/pages/ProfilePage";
import { PlayerContext, PlayerState } from '@/context/PlayerContext';
import { Track as SpotifyTrackType } from '@/types/spotify';
import { 
  formatDuration, 
  skipToNextTrackApi, 
  skipToPreviousTrackApi, 
  pausePlaybackApi,
  playTrackViaBackend,
  transferPlaybackViaBackend,
  getPlayerState
} from '@/services';
import { RoomProvider } from '@/context/RoomContext';
import { useSyncPlayerState } from '@/hooks/useSyncPlayerState';
import RoomPage from '@/pages/RoomPage';

// Extend Window interface for Spotify SDK
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

const queryClient = new QueryClient();

interface SpotifyToken {
  access_token: string;
}

const defaultTrackContext: SpotifyTrackType = {
  id: "", uri: "", name: "Not Playing", artists: [], duration_ms: 0, album: { id: "", name: "", images: [] }
};

// This is the new PlayerProvider that will contain all player logic
const PlayerProvider: React.FC<{children: React.ReactNode, token: string | null}> = ({ children, token }) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    player: null,
    deviceId: null,
    isActive: false,
    isPaused: true,
    currentTrack: defaultTrackContext,
    progressMs: 0,
    volume: 50,
  });
  const playerRef = useRef<any>(null); // To hold the Spotify.Player instance
  const onReadyCalledRef = useRef<boolean>(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialStateRestoredRef = useRef<boolean>(false);

  // Get initial player state from backend
  useEffect(() => {
    if (!token || initialStateRestoredRef.current) return;

    const fetchInitialPlayerState = async () => {
      try {
        const state = await getPlayerState(token);
        
        if (state && state.item) {
          const track: SpotifyTrackType = {
            id: state.item.id,
            name: state.item.name,
            uri: state.item.uri,
            artists: state.item.artists,
            duration_ms: state.item.duration_ms,
            album: state.item.album
          };
          
          setPlayerState(prev => ({
            ...prev,
            currentTrack: track,
            isPaused: !state.is_playing,
            progressMs: state.progress_ms || 0,
            isActive: true,
            volume: state.device?.volume_percent || prev.volume
          }));

          // Set up progress interval if the track is playing
          if (state.is_playing && progressIntervalRef.current === null) {
            progressIntervalRef.current = setInterval(() => {
              setPlayerState(prevState => {
                // Stop the interval if we've reached the end of the track
                if (prevState.currentTrack && prevState.progressMs >= prevState.currentTrack.duration_ms) {
                  if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                  return prevState;
                }
                return { ...prevState, progressMs: prevState.progressMs + 1000 };
              });
            }, 1000);
          }
        }
        
        initialStateRestoredRef.current = true;
      } catch (error) {
        console.error("Error fetching initial player state:", error);
      }
    };

    fetchInitialPlayerState();
  }, [token]);

  // Use the sync hook to keep player state in sync with backend
  useSyncPlayerState(
    playerState.isActive, 
    setPlayerState, 
    playerState.currentTrack,
    token || undefined
  );

  // SDK Initialization and Event Listeners
  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    const scriptId = 'spotify-sdk-script';

    const initializePlayer = () => {
      if (!isMounted || !window.Spotify || playerRef.current) return;
      
      const newPlayer = new window.Spotify.Player({
        name: 'Muzer Global Player',
        getOAuthToken: (cb: (token: string) => void) => cb(token),
        volume: playerState.volume / 100,
      });

      newPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        if (!isMounted) return;
        console.log('Global Player: Ready with Device ID', device_id);
        setPlayerState(s => ({ ...s, deviceId: device_id, isActive: true }));
        playerRef.current = newPlayer;
        
        // Use backend proxy for transfer playback instead of direct API call
        // Pass token for fallback mode
        transferPlaybackViaBackend(device_id, token || undefined).catch((error: Error) => 
          console.error("Error transferring playback on ready:", error)
        );
      });

      newPlayer.addListener('player_state_changed', (state: any) => {
        if (!isMounted || !state) {
          setPlayerState(s => ({ ...s, isActive: false, currentTrack: defaultTrackContext, isPaused: true, progressMs: 0 }));
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
          return;
        }
        setPlayerState(s => ({
          ...s,
          currentTrack: state.track_window.current_track || defaultTrackContext,
          isPaused: state.paused,
          progressMs: state.position,
          isActive: true,
        }));

        // Manage progress interval for smooth updates
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if (!state.paused) {
          progressIntervalRef.current = setInterval(() => {
            if (!isMounted) {
              if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
              return;
            }
            setPlayerState(prevState => {
              if (prevState.currentTrack && prevState.progressMs >= prevState.currentTrack.duration_ms) {
                if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                return prevState; // Stop interval if duration reached
              }
              return { ...prevState, progressMs: prevState.progressMs + 1000 };
            });
          }, 1000);
        } else {
          progressIntervalRef.current = null;
        }
      });
      
      // Add other error listeners as in WebPlayback.tsx
      newPlayer.addListener('initialization_error', (e:any) => console.error('Init Error', e));
      newPlayer.addListener('authentication_error', (e:any) => console.error('Auth Error', e));
      newPlayer.addListener('account_error', (e:any) => console.error('Account Error', e));
      newPlayer.addListener('playback_error', (e:any) => console.error('Playback Error', e));
      newPlayer.addListener('not_ready', ({device_id}:{device_id:string}) => {
          console.log("Global Player: Not ready", device_id);
          setPlayerState(s => ({...s, isActive: false, deviceId: device_id}));
      });

      newPlayer.connect().then((success: boolean) => {
        if (success && isMounted) console.log('Global Player: Connected');
      });
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    } else if (window.Spotify) {
      initializePlayer();
    }

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Re-initialize if token changes

  // Control Functions
  const playTrack = useCallback(async (trackUri: string, deviceIdOverride?: string) => {
    const targetDeviceId = deviceIdOverride || playerState.deviceId;
    if (!targetDeviceId) { 
      toast.error("No active Spotify device found.");
      return;
    }
    if (!trackUri) {
      playerRef.current?.pause();
      return;
    }
    try {
      console.log(`PlayerProvider: Requesting backend to play ${trackUri} on device ${targetDeviceId}`);
      // Pass token for fallback mode if available
      await playTrackViaBackend(trackUri, targetDeviceId, token || undefined);
    } catch (e) { 
      console.error("PlayerProvider: Error requesting backend to play track:", e);
      toast.error("Failed to play track. Is Spotify active?"); 
    }
  }, [playerState.deviceId, token]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current && playerState.deviceId && token && playerState.currentTrack && playerState.currentTrack.uri) {
        playTrack(playerState.currentTrack.uri, playerState.deviceId);
    } else {
        playerRef.current?.togglePlay();
    }
  }, [playerState.deviceId, token, playerState.currentTrack, playTrack]);

  const skipToNext = useCallback(() => {
    if (token) skipToNextTrackApi(token, playerState.deviceId || undefined);
  }, [token, playerState.deviceId]);
  const skipToPrevious = useCallback(() => {
    if (token) skipToPreviousTrackApi(token, playerState.deviceId || undefined);
  }, [token, playerState.deviceId]);
  const setPlayerVolume = useCallback((newVolume: number) => {
    playerRef.current?.setVolume(newVolume / 100);
    setPlayerState(s => ({ ...s, volume: newVolume }));
  }, []);

  // New function to pause current track via API
  const pauseCurrentTrack = useCallback(async () => {
    if (token && playerState.deviceId) {
      try {
        console.log("PlayerProvider: Attempting to pause playback via API");
        await pausePlaybackApi(token, playerState.deviceId);
        // Optionally, update local state if SDK doesn't fire an immediate event
        // setPlayerState(s => ({ ...s, isPaused: true })); 
      } catch (err) {
        console.error("PlayerProvider: Error pausing playback via API:", err);
      }
    } else {
      console.warn("PlayerProvider: Cannot pause, no token or deviceId");
    }
  }, [token, playerState.deviceId]);

  // Effect to update player volume when local state.volume changes
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(playerState.volume / 100).catch((e:Error) => console.error("Error setting SDK volume:", e));
    }
  }, [playerState.volume]);

  return (
    <PlayerContext.Provider value={{
      ...playerState,
      player: playerRef.current,
      setPlayerState, 
      playTrack,
      togglePlay,
      skipToNext,
      skipToPrevious,
      setPlayerVolume,
      pauseCurrentTrack
    }}>
      {children}
      {/* Render WebPlayback UI here if player is active and has a device ID */}
      {token && playerState.deviceId && <WebPlayback />}
    </PlayerContext.Provider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        {/* <Toaster /> */}
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

function AppRoutes() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [streamingToken, setStreamingToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setStreamingToken(null); // Clear token if not authenticated
      setIsLoadingToken(false);
      return;
    }
    
    const getStreamingToken = async () => {
      setIsLoadingToken(true);
      try {
        // Note the new endpoint for streaming-only token
        const response = await axios.get<SpotifyToken>(`${BACKEND_URL}/api/v1/auth/spotify_streaming_token`, {
          withCredentials: true 
        });
        if (response.data && response.data.access_token) {
          setStreamingToken(response.data.access_token);
        } else {
          setStreamingToken(null);
          setTokenError('Streaming token not found in response.');
        }
      } catch (err) {
        console.error('Error fetching streaming token:', err);
        setStreamingToken(null);
        setTokenError('Failed to authenticate with Spotify.');
      } finally {
        setIsLoadingToken(false);
      }
    };
    getStreamingToken();
  }, [isAuthenticated]);

  if (authLoading || isLoadingToken) {
    return (
      <div className="h-screen w-full bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-400">Connecting to SpotTune...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && tokenError && !streamingToken) {
    return (
      <div className="h-screen w-full bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center bg-zinc-900/40 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-zinc-400 mb-6">{tokenError}</p>
          <button 
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
            onClick={() => window.location.href = `${BACKEND_URL}/api/v1/auth/login`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    // Wrap routes with the new PlayerProvider, now passing streamingToken
    <PlayerProvider token={streamingToken}>
      <RoomProvider>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/room/:roomId" 
            element={isAuthenticated ? <RoomPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </RoomProvider>
    </PlayerProvider>
  );
}

export default App;
