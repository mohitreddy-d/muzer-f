import { useEffect, useRef, useState } from 'react';
import { PlayerState } from '@/context/PlayerContext';
import { getPlayerState } from '@/services';

// During development, set how often we attempt to sync with backend
// Set to 0 to disable automatic sync when backend endpoint isn't ready
const DEV_SYNC_INTERVAL_MS = 0; // Disable sync during development

/**
 * Hook to periodically sync player state with the backend
 * This helps keep the UI in sync with playback on other devices
 */
export function useSyncPlayerState(
  isActive: boolean,
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>,
  currentTrack: any,
  token?: string | null,
  intervalMs: number = 30000 // Default sync every 30 seconds
) {
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(DEV_SYNC_INTERVAL_MS > 0);
  const [syncErrors, setSyncErrors] = useState(0);

  // Effect for initial check if endpoint exists
  useEffect(() => {
    // Only check once on mount
    const checkEndpointAvailability = async () => {
      try {
        // First sync attempt - if it succeeds, enable regular syncing
        const state = await getPlayerState(token || undefined);
        if (state) {
          setSyncEnabled(true);
          console.log("Player state sync enabled - backend endpoint available");
        } else {
          console.log("Player state sync disabled - backend endpoint not available");
          setSyncEnabled(false);
        }
      } catch (err) {
        console.log("Player state sync disabled - backend endpoint not available");
        setSyncEnabled(false);
      }
    };

    if (DEV_SYNC_INTERVAL_MS > 0) {
      checkEndpointAvailability();
    }
  }, [token]);

  useEffect(() => {
    // Only sync if we have an active player and sync is enabled
    if (!isActive || !syncEnabled) return;
    
    // Function to sync state with backend
    const syncWithBackend = async () => {
      try {
        // Pass token for fallback mode
        const state = await getPlayerState(token || undefined);
        
        // Reset error counter on success
        if (syncErrors > 0) {
          setSyncErrors(0);
        }

        // Only update if we have a valid state and it differs from current state
        if (state && state.item) {
          const isStateDifferent = 
            !currentTrack || 
            currentTrack.id !== state.item.id || 
            Math.abs((state.progress_ms || 0) - (currentTrack.progress_ms || 0)) > 3000; // More than 3 seconds difference
          
          if (isStateDifferent) {
            console.log('Syncing player state from backend - detected state change');
            
            setPlayerState(prev => ({
              ...prev,
              currentTrack: {
                id: state.item.id,
                name: state.item.name,
                uri: state.item.uri,
                artists: state.item.artists,
                duration_ms: state.item.duration_ms,
                album: state.item.album
              },
              isPaused: !state.is_playing,
              progressMs: state.progress_ms || 0,
              volume: state.device?.volume_percent || prev.volume
            }));
          }
        }
      } catch (error) {
        console.error('Error syncing player state:', error);
        
        // Increase error counter and disable sync if too many errors
        const newErrorCount = syncErrors + 1;
        setSyncErrors(newErrorCount);
        
        // If we get 3 consecutive errors, disable sync
        if (newErrorCount >= 3) {
          console.warn('Disabling player state sync due to repeated errors');
          setSyncEnabled(false);
          if (syncTimerRef.current) {
            clearInterval(syncTimerRef.current);
            syncTimerRef.current = null;
          }
        }
      }
    };
    
    // Initial sync
    syncWithBackend();
    
    // Set up regular sync interval if not in development mode or explicitly enabled
    const actualInterval = DEV_SYNC_INTERVAL_MS || intervalMs;
    if (actualInterval > 0) {
      syncTimerRef.current = setInterval(syncWithBackend, actualInterval);
    }
    
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [isActive, setPlayerState, currentTrack, token, intervalMs, syncEnabled, syncErrors]);
} 