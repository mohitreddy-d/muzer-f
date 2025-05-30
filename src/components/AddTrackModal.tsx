import React, { useEffect, useState } from 'react';
import { searchTracks } from '@/services/searchService';
import { Track } from '@/types/spotify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AddToQueuePayload } from '@/services/roomService';

interface AddTrackModalProps {
  onSelect: (trackDetails: AddToQueuePayload) => void;
  onClose: () => void;
}

const AddTrackModal: React.FC<AddTrackModalProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delay = setTimeout(() => {
      (async () => {
        try {
          setIsSearching(true);
          const items = await searchTracks(query, 10);
          setResults(items);
        } catch (err) {
          console.error('Search error', err);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 500);
    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
      <div className={`w-full max-w-lg rounded-lg p-6 relative ${isDark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}>
        <button className="absolute top-4 right-4 text-zinc-400 hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Add Track to Queue</h2>
        <Input
          placeholder="Search for tracks"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-4 max-h-80 overflow-y-auto">
          {isSearching && <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>Searching...</p>}
          {!isSearching && results.length === 0 && query && (
            <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>No results found.</p>
          )}
          <ul className="space-y-2">
            {results.map((track) => {
              const handleSelectTrack = () => {
                const trackDetails: AddToQueuePayload = {
                  track_id: track.uri || `spotify:track:${track.id}`,
                  track_name: track.name,
                  artist: track.artists && track.artists.length > 0 ? track.artists.map(a => a.name).join(', ') : 'Unknown Artist',
                };
                onSelect(trackDetails);
              };

              return (
                <li key={track.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`} onClick={handleSelectTrack}>
                  {track.album.images?.[0]?.url ? (
                    <img src={track.album.images[0].url} alt={track.name} className="w-10 h-10 rounded" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">NoImg</div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{track.name}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{track.artists.map((a) => a.name).join(', ')}</p>
                  </div>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={(e) => { e.stopPropagation(); handleSelectTrack(); }}>
                    Add
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddTrackModal; 