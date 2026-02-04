import { useContext, createContext, type PropsWithChildren, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/auth';
import type { User } from '../types/api';

const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  user: User | null;
  isLoading: boolean;
}>({
  signIn: async () => {},
  signOut: () => {},
  user: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored session on mount
    const bootstrapAsync = async () => {
      setIsLoading(true);
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        const userJson = await SecureStore.getItemAsync('user_session');
        
        if (token && userJson) {
          const userData = JSON.parse(userJson);
          console.log("[AuthContext] Bootstrap: Session found. Full User Data:", JSON.stringify(userData, null, 2));
          setUser(userData);
        } else {
          console.log("[AuthContext] Bootstrap: No session found");
        }
      } catch (e) {
        console.error('Restoring session failed', e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();

    // Listen for global unauthorized events
    const { DeviceEventEmitter } = require('react-native');
    const authSubscription = DeviceEventEmitter.addListener('unauthorized', () => {
        console.warn("[AuthContext] Event: unauthorized received. Clearing user state.");
        setUser(null);
    });

    return () => {
        authSubscription.remove();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email: string, password: string) => {
           setIsLoading(true);
           try {
             // Call real backend API
             const data = await authService.login(email, password);
             
             // Store token and user data
             await SecureStore.setItemAsync('auth_token', data.token);
             await SecureStore.setItemAsync('user_session', JSON.stringify(data.user));
             
             console.log("[AuthContext] SignIn: Success. User:", data.user.email);
             setUser(data.user);
           } catch (error: any) {
             console.error("[AuthContext] SignIn: Failed", error.message);
             // Re-throw error so UI can handle it
             throw new Error(error.response?.data?.message || 'Login failed');
           } finally {
             setIsLoading(false);
           }
        },
        signOut: async () => {
          console.log("[AuthContext] SignOut: Triggered");
          setUser(null);
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('user_session');
        },
        user,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
