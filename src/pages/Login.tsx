import { Button } from "@/components/ui/button";
import { Music2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState, useEffect } from "react";

const Login = () => {
  const { loginWithSpotify, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Animate the login card after a delay
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`min-h-screen w-full flex items-center justify-center ${
      isDark 
        ? 'bg-gradient-to-b from-black to-zinc-900' 
        : 'bg-gradient-to-b from-white to-zinc-100'
    } transition-colors duration-300 relative overflow-hidden`}>
      
      <div className="absolute top-4 right-4 rounded-full z-10">
        <ThemeToggle />
      </div>
      
      <div className={`w-full max-w-md px-4 z-10 transition-all duration-1000 transform ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className={`p-6 ${
          isDark 
            ? 'bg-zinc-900/40' 
            : 'bg-white/70'
        } rounded-lg shadow-sm overflow-hidden relative`}>
          
          <div className="flex flex-col items-center space-y-5">
            <div className="rounded-full bg-red-500 p-3 flex items-center justify-center">
              <Music2 className="w-9 h-9 text-white" />
            </div>
            
            <div className="space-y-1.5 text-center">
              <h1 className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>Welcome to Muzer</h1>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Login with your Spotify account to continue
              </p>
            </div>
            
            <Button 
              size="sm"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              onClick={loginWithSpotify}
            >
              <Music2 className="mr-1.5 h-4 w-4" />
              <span className="text-sm">Continue with Spotify</span>
            </Button>
            
            <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-black/10'} pt-3`}>
              <p className="text-xs text-zinc-500 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500">
            Share music with friends and discover new tracks together
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
