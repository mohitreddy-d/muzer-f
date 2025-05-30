import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from 'lucide-react';
import Color from 'color';
import { Button } from "@/components/ui/button";
import { formatDuration } from '@/services/spotifyService';
import { usePlayer } from '@/context/PlayerContext';
import { useTheme } from '@/context/ThemeContext';

interface WebPlaybackProps {}

const WebPlayback: React.FC<WebPlaybackProps> = () => {
  const {
    isActive,
    isPaused,
    currentTrack,
    progressMs,
    volume,
    togglePlay,
    skipToNext,
    skipToPrevious,
    setPlayerVolume,
  } = usePlayer();
  
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [dominantColor, setDominantColor] = useState<string | null>(null);

  const getDominantColor = useCallback((imageUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!imageUrl) { resolve(null); return; }
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let r = 0, g = 0, b = 0;
          const pixelCount = data.length / 4;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i + 1]; b += data[i + 2];
          }
          resolve(`rgb(${Math.floor(r/pixelCount)}, ${Math.floor(g/pixelCount)}, ${Math.floor(b/pixelCount)})`);
        } catch (e) { console.error("Error processing image data:", e); resolve(null); }
      };
      img.onerror = () => { console.error("Error loading image for color extraction"); resolve(null); };
    });
  }, []);

  useEffect(() => {
    const imageUrl = currentTrack?.album?.images?.[0]?.url;
    if (imageUrl) {
      getDominantColor(imageUrl).then(setDominantColor);
    } else {
      setDominantColor(null);
    }
  }, [currentTrack, getDominantColor]);

  const progressPercentage = currentTrack?.duration_ms && currentTrack.duration_ms > 0
    ? (progressMs / currentTrack.duration_ms) * 100 
    : 0;
  
  const currentTime = formatDuration(progressMs);
  const totalTime = formatDuration(currentTrack?.duration_ms || 0);
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  const playerPillStyle = useMemo(() => {
    if (dominantColor) {
      try {
        const color = Color(dominantColor);
        const glassBgAlpha = isDark ? 0.7 : 0.65;
        const glassBorderAlpha = isDark ? 0.6 : 0.4;
        return {
          backgroundColor: color.alpha(glassBgAlpha).string(),
          borderColor: color.alpha(glassBorderAlpha).string(),
        };
      } catch (e) { /* Fallback handled below */ }
    }
    return isDark 
      ? { backgroundColor: 'rgba(30, 30, 30, 0.75)', borderColor: 'rgba(70, 70, 70, 0.6)' } 
      : { backgroundColor: 'rgba(250, 250, 250, 0.75)', borderColor: 'rgba(220, 220, 220, 0.6)' };
  }, [dominantColor, isDark]);

  const primaryTextColor = isDark ? 'text-white' : 'text-zinc-900';
  const secondaryTextColor = isDark ? 'text-zinc-300' : 'text-zinc-600';
  const playerIconColor = isDark ? 'text-zinc-200' : 'text-zinc-700';
  const controlButtonBgHover = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5';
  const mainPlayPauseIconColor = isDark ? 'text-black' : 'text-white'; 
  const mainPlayPauseBgClass = isDark ? 'bg-white hover:bg-zinc-200' : 'bg-black hover:bg-zinc-800';
  const volumeSliderThumbClass = isDark ? '[&::-webkit-slider-thumb]:bg-white' : '[&::-webkit-slider-thumb]:bg-black';
  const volumeSliderTrackClass = isDark ? 'bg-white/20' : 'bg-black/10';
  const progressFilledClass = isDark ? 'bg-red-400/80' : 'bg-red-500/90'; 
  const progressTrackClass = isDark ? 'bg-white/10' : 'bg-black/10';

  if (!isActive && !currentTrack?.id) {
    return null; 
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] xl:w-[900px]">
      <div
        className={`relative pt-3 pb-8 px-4 shadow-xl rounded-2xl flex flex-col backdrop-blur-lg overflow-hidden border`}
        style={playerPillStyle}
      >
        {/* Top part: Track Info, Controls, Volume */}
        <div className="grid grid-cols-12 w-full items-center gap-x-2">
          {/* Track Info */}
          <div className="flex items-center space-x-3 min-w-0 col-span-4 max-w-[200px] sm:max-w-[250px]">
            {currentTrack?.album?.images?.[0]?.url && (
              <img
                src={currentTrack.album.images[0].url}
                alt={currentTrack.album.name}
                className="h-10 w-10 rounded-md shadow object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 w-full">
              <p className={`font-semibold text-sm truncate ${primaryTextColor}`}>{currentTrack?.name || 'Not Playing'}</p>
              <p className={`text-xs truncate mt-0.5 ${secondaryTextColor}`}>
                {currentTrack?.artists?.map(a => a.name).join(', ') || ''}
              </p>
            </div>
          </div>
          
          {/* Playback Controls */}
          <div className="flex items-center justify-center col-span-4">
            <Button variant="ghost" size="icon" className={`${playerIconColor} ${controlButtonBgHover} rounded-full h-8 w-8 p-0`} onClick={skipToPrevious} disabled={!isActive}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
               className={`rounded-full h-9 w-9 p-0 flex items-center justify-center shadow-md mx-2.5 ${mainPlayPauseBgClass}`}
              onClick={togglePlay}
              disabled={!isActive}
            >
              {isPaused ? <Play className={`h-4 w-4 ml-0.5 ${mainPlayPauseIconColor}`} /> : <Pause className={`h-4 w-4 ${mainPlayPauseIconColor}`} />}
            </Button>
            <Button variant="ghost" size="icon" className={`${playerIconColor} ${controlButtonBgHover} rounded-full h-8 w-8 p-0`} onClick={skipToNext} disabled={!isActive}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center justify-end space-x-2 col-span-4">
            <div className="hidden sm:flex items-center space-x-1.5">
              <Button variant="ghost" size="icon" className={`${playerIconColor} ${controlButtonBgHover} rounded-full h-8 w-8 p-0`} onClick={() => setPlayerVolume(volume === 0 ? 50 : 0)} disabled={!isActive}>
                <VolumeIcon className="h-4 w-4" />
              </Button>
              <div className="w-20">
                <input
                  type="range" min="0" max="100" value={volume} onChange={(e) => setPlayerVolume(parseInt(e.target.value))}
                  className={`w-full h-1 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${volumeSliderTrackClass} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full ${volumeSliderThumbClass}`}
                  disabled={!isActive}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-2 px-3 pt-1">
          <div className="h-1 w-full bg-black/20 dark:bg-white/20 rounded-full relative overflow-hidden">
            <div 
              className={`absolute h-full transition-transform duration-150 ease-linear ${progressFilledClass} rounded-full`}
              style={{ transform: `translateX(-${100 - progressPercentage}%)`, width: '100%' }}
            ></div>
          </div>
        </div>
        
        <div className="absolute bottom-3 left-0 right-0 w-full flex justify-between px-4 text-[10px] pointer-events-none">
          <span className={`${dominantColor && Color(dominantColor).isDark() ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-300'}`}>{currentTime}</span>
          <span className={`${dominantColor && Color(dominantColor).isDark() ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-300'}`}>{totalTime}</span>
        </div>
      </div>
    </div>
  );
};

export default WebPlayback; 