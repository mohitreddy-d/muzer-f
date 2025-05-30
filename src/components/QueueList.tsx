import React from 'react';
import { QueueItem } from '@/services/roomService';
import { ArrowUp, ArrowDown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

interface QueueListProps {
  queue: QueueItem[];
  onVote: (itemId: string, vote: 1 | -1) => void;
  onPlay?: (trackUri: string) => void;
}

const QueueList: React.FC<QueueListProps> = ({ queue, onVote, onPlay }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!queue.length) {
    return <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Queue is empty. Add some tracks!</p>;
  }

  return (
    <ul className="space-y-3">
      {queue.map((item, index) => (
        <li
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'border-zinc-700' : 'border-zinc-200'} ${index === 0 ? (isDark ? 'bg-red-500/5 border-red-500/40' : 'bg-red-100 border-red-400/40') : (isDark ? 'bg-zinc-900' : 'bg-white')}`}
        >
          {item.track.album?.images?.[0]?.url ? (
            <img src={item.track.album.images[0].url} alt="cover" className="w-12 h-12 rounded" />
          ) : (
            <div className="w-12 h-12 rounded bg-zinc-700" />
          )}
          <div className="flex-1">
            <p className="text-white font-medium truncate">{item.track.name}</p>
            <p className="text-xs text-zinc-400 truncate">
              {item.track.artists.map((a) => a.name).join(', ')}
            </p>
          </div>
          <div className="flex flex-col items-center w-10 text-sm">
            <button onClick={() => onVote(item.id, 1)} className="text-green-400 hover:text-green-300">
              <ArrowUp className="w-4 h-4" />
            </button>
            <span className="text-white">{item.votes}</span>
            <button onClick={() => onVote(item.id, -1)} className="text-red-400 hover:text-red-300">
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
          {onPlay && (
            <Button size="icon" variant="ghost" onClick={() => onPlay(item.track.uri || `spotify:track:${item.track.id}`)}>
              <Play className="w-4 h-4" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default QueueList; 