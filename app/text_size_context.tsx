import React, { createContext, useState, useContext, ReactNode } from 'react';

// Step 1: Define the type
type TextSizeContextType = {
  textSize: number;
  setTextSize: (size: number) => void;
};

// Step 2: Create context with default value
const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

// Step 3: Create provider
export const TextSizeProvider = ({ children }: { children: ReactNode }) => {
  const [textSize, setTextSize] = useState(16); // Default size

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};

// Step 4: Custom hook with safety check
export const useTextSize = (): TextSizeContextType => {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
};
