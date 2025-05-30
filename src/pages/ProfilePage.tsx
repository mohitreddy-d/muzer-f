import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Link } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Music, Users, Clock, BarChart2, LogOut } from 'lucide-react';
import { Track, Artist, UserProfile } from '@/types/spotify';
import { 
  getTopTracks, 
  formatDuration,
  getUserProfile,
  getTopArtists
} from '@/services/spotifyService';
import { BACKEND_URL } from '@/constants'; // For fetching the access token
import axios from 'axios'; // For fetching the access token
import { Avatar } from '@/components/ui/avatar'; // Corrected import casing

interface SpotifyToken {
    access_token: string;
}

const ProfilePage = () => {
  const { logout } = useAuth(); // Assuming useAuth provides logout
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string>("");

  const toastStyle = useMemo(() => ({
    borderRadius: '8px',
    background: isDark ? '#27272a' : '#fff',
    color: isDark ? '#fff' : '#18181b',
    border: `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  }), [isDark]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get<SpotifyToken>(`${BACKEND_URL}/api/v1/auth/spotify_token`, { 
          withCredentials: true 
        });
        if (response.data && response.data.access_token) {
          setToken(response.data.access_token);
        } else {
          throw new Error("Access token not found");
        }
      } catch (error) {
        console.error("Failed to fetch token for profile page:", error);
        toast.error("Failed to authenticate for profile data", { style: toastStyle });
        setIsLoading(false); 
      }
    };
    fetchToken();
  }, [toastStyle]);

  useEffect(() => {
    if (!token) return; 

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userProfile = await getUserProfile();
        const userTopTracks = await getTopTracks(5, 0, 'medium_term'); 
        const userTopArtists = await getTopArtists(3);

        setProfile(userProfile);
        setTopTracks(userTopTracks);
        setTopArtists(userTopArtists);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast.error("Failed to load profile data", { style: toastStyle });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, toastStyle]);

  useEffect(() => {
    console.log(profile, topArtists, topTracks);
  }, [profile, topArtists, topTracks]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Failed to load profile. Please ensure you are logged in.</p>
        <Link to="/">
          <Button variant="link" className="mt-4 text-red-500">Go Home</Button>
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    toast.info("Logging out...", { style: toastStyle, duration: 2000 });
    setTimeout(() => {
      logout(); 
    }, 500);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-black to-zinc-900' : 'bg-gradient-to-b from-gray-50 to-zinc-100'} ${isDark ? 'text-white' : 'text-zinc-900'}`}>
      {/* Header with Back Button */}
      <header className={`py-4 px-6 sticky top-0 z-20 ${isDark ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-md border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" className={`${isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-700 hover:text-black'}`}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className={`flex items-center ${isDark ? 'text-zinc-300 hover:text-red-500' : 'text-zinc-700 hover:text-red-500'}`}>
                <LogOut className="w-4 h-4 mr-1.5" />
                Logout
            </Button>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-12">
        {/* Profile Header */}
        <section className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
          <Avatar 
            src={profile.images?.[0]?.url}
            name={profile.display_name}
            size="xl"
            shape="circle"
            className="border-4 border-red-500/50 shadow-lg"
          />
          <div className="text-center md:text-left">
            <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-red-600'}`}>Profile</p>
            <h1 className={`text-4xl md:text-5xl font-bold mt-1`}>{profile.display_name}</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {profile.followers.total} Followers • {profile.country}
            </p>
             <p className={`mt-1 text-xs capitalize ${profile.product === 'premium' ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-zinc-500' : 'text-zinc-500')}
                             border ${profile.product === 'premium' ? (isDark ? 'border-green-400/30' : 'border-green-600/30') : (isDark ? 'border-zinc-700' : 'border-zinc-400')} 
                             px-2 py-0.5 rounded-full inline-block`}>
                {profile.product}
            </p>
          </div>
        </section>

        {/* Top Artists Section */}
        <section>
          <h2 className={`text-2xl font-semibold mb-4`}>Top Artists This Month</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topArtists.map(artist => (
              <div key={artist.id} className={`p-4 rounded-lg ${isDark ? 'bg-zinc-800/30 hover:bg-zinc-800/50' : 'bg-white hover:bg-gray-50 shadow-sm border border-gray-100'} transition-colors flex flex-col items-center text-center`}>
                <Avatar 
                  src={artist.images?.[0]?.url}
                  name={artist.name}
                  size="lg"
                  shape="circle"
                  className="mb-3 shadow-md"
                />
                <p className={`font-medium`}>{artist.name}</p>
                {artist.genres && artist.genres.length > 0 && (
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {artist.genres.slice(0,2).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Top Tracks Section */}
        <section>
          <h2 className={`text-2xl font-semibold mb-4`}>Top Tracks This Month</h2>
          <div className="space-y-2">
            {topTracks.map((track, index) => (
              <div key={track.id} className={`p-3 rounded-lg ${isDark ? 'bg-zinc-800/30 hover:bg-zinc-800/50' : 'bg-white hover:bg-gray-50 shadow-sm border border-gray-100'} transition-colors flex items-center space-x-3`}>
                <p className={`text-sm w-6 text-right ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{index + 1}</p>
                <Avatar 
                    src={track.album.images[0]?.url}
                    name={track.album.name}
                    size="md"
                    shape="rounded"
                    className="shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate`}>{track.name}</p>
                  <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{track.artists.map(a => a.name).join(', ')}</p>
                </div>
                <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{formatDuration(track.duration_ms)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage; 