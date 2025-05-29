// context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type AppUser = {
  userID: string;
  name: string;
  email: string;
  photo: string;
  provider: 'google' | 'local';
};

type AuthContextType = {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
