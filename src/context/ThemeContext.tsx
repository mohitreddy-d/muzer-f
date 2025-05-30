import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

// Define a context type that matches next-themes
type ThemeContextType = {
  theme: string | undefined;
  setTheme: (theme: string) => void;
};

export const ThemeProviderContext = createContext<ThemeContextType>({ 
  theme: "dark",
  setTheme: () => null,
});

// Create a hook to expose theme state and functions
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
    </NextThemesProvider>
  );
}

// Create a wrapper component that provides theme context values
function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme();
  
  const value = {
    theme,
    setTheme,
  };
  
  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Export a hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 