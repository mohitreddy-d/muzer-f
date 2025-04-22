
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { loginWithSpotify,isAuthenticated } = useAuth();
  console.log(isAuthenticated)
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#121212] to-[#181818]">
      <div className="w-full max-w-md px-4">
        <Card className="p-8 bg-black/40 backdrop-blur-xl border-white/10">
          <div className="flex flex-col items-center space-y-6">
            <div className="rounded-full bg-red-500 p-4">
              <Music2 className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
              <p className="text-sm text-zinc-400">Login with your Spotify account to continue</p>
            </div>
            <Button 
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
              onClick={loginWithSpotify}
            >
              <Music2 className="mr-2 h-5 w-5" />
              Continue with Spotify
            </Button>
            <p className="text-xs text-zinc-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
