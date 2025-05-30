import React from 'react';
import { Music2, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/constants";

const Login = () => {
  return (
    <div className="h-screen w-full bg-gradient-to-b from-black to-zinc-900 flex flex-col items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 space-y-8 bg-zinc-900/40 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <Music2 className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white">Muzer</h1>
          <p className="text-zinc-400 text-sm max-w-sm">
            Connect with your Spotify account to start streaming and sharing music with friends.
          </p>
        </div>
        
        <div className="pt-4">
          <Button
            className="w-full py-6 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2"
            onClick={() => window.location.href = `${BACKEND_URL}/api/v1/auth/login`}
          >
            <LogIn className="w-5 h-5" />
            <span>Login with Spotify</span>
          </Button>
        </div>
        
        <p className="text-center text-zinc-500 text-xs pt-4">
          By logging in, you agree to Spotify's Terms of Service and Privacy Policy.
        </p>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <p className="text-zinc-500 text-sm">Powered by Spotify API</p>
        <p className="text-zinc-600 text-xs mt-1">©{new Date().getFullYear()} Muzer</p>
      </div>
    </div>
  );
};

export default Login; 