import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Music2, 
  Users, 
  Play,
  Heart,
  Search,
  LogOut,
  Sparkles,
  Star,
  Disc,
  Headphones,
  Radio,
  Mic2,
  Guitar,
  Volume2,
  Pause
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { InteractiveButton } from "@/components/ui/interactive-button";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { Track } from "@/types/spotify";
import { getTopTracks, formatDuration } from "@/services/spotifyService";
import { BACKEND_URL } from "@/constants";
import { Link, useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useRoom } from "@/context/RoomContext";
import CreateRoomDialog from "@/components/CreateRoomDialog";

// Add CSS for playing animation with gentler red color
const PlayingIndicator = () => (
  <div className="flex items-center space-x-0.5 ml-2">
    <span className="w-0.5 h-2.5 bg-red-400/70 animate-playing-bar1"></span>
    <span className="w-0.5 h-3.5 bg-red-400/70 animate-playing-bar2"></span>
    <span className="w-0.5 h-2 bg-red-400/70 animate-playing-bar3"></span>
  </div>
);

// Create album placeholder icons array
const albumIcons = [
  { icon: Disc, color: "bg-red-500" },
  { icon: Headphones, color: "bg-blue-500" },
  { icon: Radio, color: "bg-green-500" },
  { icon: Mic2, color: "bg-yellow-500" },
  { icon: Guitar, color: "bg-purple-500" },
  { icon: Volume2, color: "bg-pink-500" },
];

const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [topTracksError, setTopTracksError] = useState<string | null>(null);
  const [trackOffset, setTrackOffset] = useState(0);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);
  const TRACKS_PER_PAGE = 6;
  
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { joinRoom, currentRoom } = useRoom();
  const navigate = useNavigate();

  const {
    playTrack: contextPlayTrack,
    currentTrack: contextCurrentTrack,
    isPaused: contextIsPaused,
    deviceId: contextDeviceId,
    pauseCurrentTrack,
  } = usePlayer();
  
  const currentPlayingTrackId = contextCurrentTrack?.id;

  const toastStyle = useMemo(() => ({
    borderRadius: '8px',
    background: isDark ? '#27272a' : '#fff',
    color: isDark ? '#fff' : '#18181b',
    border: `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  }), [isDark]);

  const fetchTopTracks = async (reset: boolean = true) => {
    try {
      if (reset) {
        setIsLoading(true);
        setTrackOffset(0);
        setTopTracksError(null);
      } else {
        setIsLoadingMore(true);
      }
      const offset = reset ? 0 : trackOffset;
      const data = await getTopTracks(TRACKS_PER_PAGE, offset, "medium_term");
      
      if (reset) setTopTracks(data);
      else setTopTracks(prev => [...prev, ...data]);
      
      setTrackOffset(prev => reset ? TRACKS_PER_PAGE : prev + TRACKS_PER_PAGE);
      setHasMoreTracks(data.length === TRACKS_PER_PAGE);
    } catch (error) {
      console.error("Failed to fetch top tracks:", error);
      setTopTracksError(error instanceof Error ? error.message : "Failed to load tracks");
      toast.error("Failed to load top tracks", { style: toastStyle, duration: 3000, description: error instanceof Error ? error.message : "Please try again later" });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  useEffect(() => {
    fetchTopTracks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreTracks) fetchTopTracks(false);
  };
  
  const handleCreateRoom = () => {
    setShowCreateRoomDialog(true);
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code", {
        style: toastStyle,
        duration: 3000,
      });
      return;
    }

    try {
      const room = await joinRoom(roomCode.trim());
      if (room) {
        setRoomCode("");
        navigate(`/room/${room.id}`);
      }
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const handleLogout = async () => {
    toast.info("Logging out...", { style: toastStyle, duration: 2000 });
    if (contextCurrentTrack && contextDeviceId) {
      try {
        console.log("Home: Attempting to pause playback on logout via context");
        await pauseCurrentTrack();
      } catch (err) {
        console.error("Home: Error pausing on logout via context:", err);
      }
    }
    setTimeout(() => logout(), 500);
  };

  const handlePlayTrackOnPage = (track: Track) => {
    if (!contextDeviceId && !sessionStorage.getItem('spotifyDeviceId')) {
        toast.error("Player not ready. Please ensure Spotify is active.", {style: toastStyle, duration: 3000});
        return;
    }
    const trackUri = track.uri || `spotify:track:${track.id}`;
    console.log(`Home: Playing ${trackUri} on device ${contextDeviceId || sessionStorage.getItem('spotifyDeviceId')}`);
    contextPlayTrack(trackUri, contextDeviceId || sessionStorage.getItem('spotifyDeviceId') || undefined).catch(e => {
        toast.error("Could not start playback.", { style: toastStyle, duration: 3000 });
    });
  };

  return (
    <div className={`min-h-screen w-full  ${
      isDark 
        ? 'bg-gradient-to-b from-black to-zinc-900' 
        : 'bg-gradient-to-b from-white to-zinc-100'
    } transition-colors duration-300 relative overflow-hidden pb-32`}>
      
      {/* Header */}
      <header className={`py-3 border-b ${isDark ? 'border-white/10 bg-black/10' : 'border-gray-200 bg-white'} backdrop-blur-sm relative z-10`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-6 h-6 text-red-500" />
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Muzer</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className={isDark ? 'text-white hover:bg-white/10' : 'text-zinc-800 hover:bg-zinc-100'}>
              <Heart className="w-4 h-4 mr-1.5" />
              <span className="text-sm">Favorites</span>
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="sm" className={isDark ? 'text-white hover:bg-white/10' : 'text-zinc-800 hover:bg-zinc-100'}>
                <Users className="w-4 h-4 mr-1.5" />
                <span className="text-sm">Profile</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className={isDark ? 'text-white hover:bg-white/10' : 'text-zinc-800 hover:bg-zinc-100'} onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="text-sm">Logout</span>
            </Button>
            <div className={`border-l ${isDark ? 'border-white/10' : 'border-gray-200'} pl-3`}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create/Join Room Section */}
          <div className={`p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 ${isDark ? 'bg-transparent' : 'bg-transparent'}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Virtual Music Room</h2>
                <Sparkles className="w-5 h-5 text-red-500" />
              </div>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {currentRoom 
                  ? `Currently in room: ${currentRoom.name} (Code: ${currentRoom.code})`
                  : 'Create a room or join an existing one to start sharing music with friends.'}
              </p>
              
              <div className="space-y-3">
                {/* Create Room Button */}
                <InteractiveButton 
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white font-medium"
                  onClick={handleCreateRoom}
                >
                  <Play className="h-4 w-4" />
                  Create New Room
                </InteractiveButton>
                
                {/* Join Room Section */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className={`${isDark ? 'bg-transparent border-zinc-800 text-white placeholder:text-zinc-500' : 'bg-transparent border-zinc-200 text-zinc-900 placeholder:text-zinc-500'} flex-grow h-8 text-sm`}
                  />
                  <InteractiveButton 
                    size="sm"
                    onClick={handleJoinRoom}
                    className={`${isDark ? 'bg-transparent hover:bg-zinc-800 border border-zinc-800 text-white' : 'bg-transparent hover:bg-zinc-100 border border-zinc-200 text-zinc-800'} text-sm`}
                  >
                    Join Room
                  </InteractiveButton>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className={`p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 ${isDark ? 'bg-transparent' : 'bg-transparent'}`}>
            <div className="space-y-3">
              <div className={`flex items-center gap-2 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} pb-2`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Recent Rooms</h3>
                <Star className="w-4 h-4 text-red-500" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      isDark 
                        ? 'border-zinc-800 hover:border-zinc-700 bg-transparent' 
                        : 'border-zinc-200 hover:border-zinc-300 bg-transparent'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Music2 className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>Party Room #{i}</p>
                        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>5 active members</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`${isDark ? 'text-white hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'} px-2 py-0 h-7 text-xs border ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}
                    >
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Songs Section */}
        <div className={`mt-6 rounded-lg p-5 border border-zinc-200 dark:border-zinc-800 ${isDark ? 'bg-transparent' : 'bg-transparent'}`}>
          <div className={`flex items-center justify-between mb-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} pb-3`}>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Your Top Tracks</h2>
              <Sparkles className="w-4 h-4 text-red-500" />
            </div>
            {topTracksError ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => fetchTopTracks()}
                className={`text-xs ${isDark 
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
                  : 'text-zinc-600 hover:text-zinc-800 hover:bg-zinc-200'
                }`}
              >
                Retry
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                className={`text-xs ${isDark 
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
                  : 'text-zinc-600 hover:text-zinc-800 hover:bg-zinc-200'
                }`}
              >
                View All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {isLoading ? (
              // Loading skeleton
              Array(TRACKS_PER_PAGE).fill(0).map((_, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-lg border ${
                    isDark ? 'border-zinc-800 bg-transparent' : 'border-zinc-200 bg-transparent'
                  } animate-pulse`}
                >
                  <div className={`w-10 h-10 rounded-md bg-zinc-800/50 dark:bg-zinc-700/50`}></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-2.5 bg-zinc-300/50 dark:bg-zinc-700/50 rounded w-3/4"></div>
                    <div className="h-2 bg-zinc-300/50 dark:bg-zinc-700/50 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : topTracksError ? (
              <div className={`col-span-3 p-6 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <div className="mb-3">Error loading tracks: {topTracksError}</div>
                <Button 
                  onClick={() => fetchTopTracks()}
                  size="sm"
                  className={`${isDark ? 'bg-transparent border border-zinc-800 hover:bg-zinc-800' : 'bg-transparent border border-zinc-200 hover:bg-zinc-100'}`}
                >
                  Try Again
                </Button>
              </div>
            ) : topTracks.length > 0 ? (
              <>
                {topTracks.map((track) => {
                    const isCurrentlyPlaying = track.id === currentPlayingTrackId;
                    return (
                      <div 
                        key={track.id}
                        className={`flex items-center gap-3 p-2 rounded-lg border ${
                          isCurrentlyPlaying 
                            ? (isDark ? 'border-red-500/40 bg-red-500/5' : 'border-red-400/40 bg-red-400/5') 
                            : (isDark 
                              ? 'border-zinc-800 hover:border-zinc-700 bg-transparent' 
                              : 'border-zinc-200 hover:border-zinc-300 bg-transparent')
                        } transition-all duration-150 cursor-pointer`}
                        onClick={() => handlePlayTrackOnPage(track)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden border border-zinc-800/20 flex-shrink-0">
                          <img 
                            src={track.album.images[0]?.url || ''} 
                            alt={track.album.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className={`font-medium text-sm truncate transition-colors ${isCurrentlyPlaying ? (isDark ? 'text-red-400' : 'text-red-500/80') : (isDark ? 'text-white hover:text-red-400' : 'text-zinc-900 hover:text-red-500/80')}`}>
                              {track.name}
                            </p>
                            {isCurrentlyPlaying && <PlayingIndicator />}
                          </div>
                          <div className="flex items-center text-xs">
                            <p className={`truncate ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                              {track.artists.map(artist => artist.name).join(', ')}
                            </p>
                            <span className={`mx-1.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>•</span>
                            <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                              {formatDuration(track.duration_ms)}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => { 
                              e.stopPropagation();
                              if (isCurrentlyPlaying && !contextIsPaused) {
                                contextPlayTrack('');
                              } else {
                                handlePlayTrackOnPage(track);
                              }
                          }}
                          className={`rounded-full p-1 h-7 w-7 flex items-center justify-center border flex-shrink-0 ${
                            isCurrentlyPlaying 
                              ? (isDark ? 'text-red-400/90 border-red-500/30 hover:border-red-500/40' : 'text-red-500/70 border-red-400/20 hover:border-red-400/30') 
                              : (isDark 
                                ? 'text-zinc-400 hover:text-white hover:bg-transparent border-zinc-800 hover:border-zinc-700' 
                                : 'text-zinc-600 hover:text-zinc-800 hover:bg-transparent border-zinc-200 hover:border-zinc-300')
                          }`}
                        >
                          {isCurrentlyPlaying && !contextIsPaused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    );
                 })}
                
                {/* Load more button */}
                {hasMoreTracks && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-3 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className={`w-1/3 ${isDark ? 'border-zinc-700 text-zinc-300 bg-transparent' : 'border-zinc-300 text-zinc-700 bg-transparent'}`}
                    >
                      {isLoadingMore ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-zinc-500 animate-spin"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className={`col-span-3 p-4 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                No tracks found. Start listening to build your top tracks!
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Room Dialog */}
      <CreateRoomDialog 
        isOpen={showCreateRoomDialog}
        onClose={() => setShowCreateRoomDialog(false)}
      />
    </div>
  );
};

export default Home;