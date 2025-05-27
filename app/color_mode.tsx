// ColorModeContext.js
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorModeContextType = {
  colorMode: string;
  changeColorMode: (mode: string) => void;
}

export const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

export const ColorModeProvider = ({ children }: { children : ReactNode }) => {
  const [colorMode, setColorMode] = useState('normal');

  // Load saved mode on app start
  useEffect(() => {
    (async () => {
      const storedMode = await AsyncStorage.getItem('colorMode');
      if (storedMode) setColorMode(storedMode);
    })();
  }, []);

  const changeColorMode = async (mode:string) => {
    setColorMode(mode);
    await AsyncStorage.setItem('colorMode', mode);
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, changeColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }
  return context;
};
