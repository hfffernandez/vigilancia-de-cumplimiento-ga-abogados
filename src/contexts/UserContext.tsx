import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { userService } from '../services/db';

interface UserContextType {
  user: UserProfile | null;
  allUsers: UserProfile[];
  isLoggedIn: boolean;
  login: (userId: string) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refreshUser = useCallback(() => {
    const currentUser = userService.get();
    const sessionId = userService.getSession();
    
    setAllUsers(userService.getAllUsers());
    
    if (sessionId && currentUser && currentUser.id === sessionId) {
      setUser(currentUser);
      setIsLoggedIn(true);
    } else if (sessionId) {
      const sessionUser = userService.getAllUsers().find(u => u.id === sessionId);
      if (sessionUser) {
        setUser(sessionUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (userId: string) => {
    const newUser = userService.switchUser(userId);
    setUser(newUser);
    setIsLoggedIn(true);
    setAllUsers(userService.getAllUsers());
  };

  const logout = () => {
    userService.clearSession();
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateProfile = async (profile: UserProfile) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    userService.update(profile);
    setUser(profile);
    setAllUsers(userService.getAllUsers());
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      allUsers, 
      isLoggedIn, 
      login, 
      logout, 
      updateProfile,
      refreshUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
