import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"
import SpotifyWebPlayback from "react-spotify-web-playback-sdk-headless";

interface User {
    name: string
    id: string
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: any
  loading: boolean;
  user: User | null
  loginWithSpotify: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null)
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for auth_token in cookies
    const getAuthStatus = async () => {
        try {
            const res = await axios.get(BACKEND_URL + "/api/v1/auth/status", {withCredentials: true})
            const user = res.data
            if(!user) throw new Error("No user returned");
            setUser(user);
            setIsAuthenticated(true);
        }
        catch (e: any) {
            setIsAuthenticated(false);
            setUser(null);
        }
        setLoading(false);
    };
    getAuthStatus();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      if (location.pathname === "/login") {
        navigate("/");
      }
    } else {
      if (location.pathname !== "/login") {
        navigate("/login");
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  const loginWithSpotify = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}${LOGIN_ENDPOINT}`, {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to get login URL");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from backend");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    try {
      const res = await axios.get(BACKEND_URL + "/api/v1/auth/logout", {withCredentials: true})
      if (res.status !== 200) throw new Error("Failed to logout");
  
      setIsAuthenticated(false);
      setUser(null);
    }
    catch (e: any) {
      console.error("Logout error:", e);
    }
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, loginWithSpotify, logout, setIsAuthenticated, user }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}