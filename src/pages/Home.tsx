
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Music2, 
  Users, 
  Play,
  Heart,
  Search
} from "lucide-react";
import { useState } from "react";

const Home = () => {
  const [roomCode, setRoomCode] = useState("");

  const handleCreateRoom = () => {
    // TODO: Implement room creation
    console.log("Creating room...");
  };

  const handleJoinRoom = () => {
    // TODO: Implement room joining
    console.log("Joining room with code:", roomCode);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-zinc-900">
      {/* Header */}
      <header className="p-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">SpotTune</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white">
              <Heart className="w-5 h-5 mr-2" />
              My Favorites
            </Button>
            <Button variant="ghost" className="text-white">
              <Users className="w-5 h-5 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create/Join Room Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Virtual Music Room</h2>
            <p className="text-zinc-400">Create a room or join an existing one to start sharing music with friends.</p>
            
            <div className="flex flex-col gap-4">
              <Button 
                size="lg" 
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleCreateRoom}
              >
                <Play className="mr-2 h-5 w-5" />
                Create New Room
              </Button>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                <Button 
                  onClick={handleJoinRoom}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Join Room
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Recent Rooms</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Party Room #{i}</p>
                        <p className="text-sm text-zinc-400">5 active members</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-zinc-400 hover:text-white">
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Top Songs Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Top Tracks</h2>
            <Button variant="ghost" className="text-zinc-400 hover:text-white">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-12 h-12 bg-zinc-800 rounded"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">Song Name #{i}</p>
                  <p className="text-sm text-zinc-400 truncate">Artist Name</p>
                </div>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;