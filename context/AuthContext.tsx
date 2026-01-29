import { useContext, createContext, type PropsWithChildren, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
// import { authService } from '../services/auth';

const AuthContext = createContext<{
  signIn: (email?: string, password?: string) => Promise<void>;
  signOut: () => void;
  user: { name: string } | null;
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
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored session on mount
    const bootstrapAsync = async () => {
      setIsLoading(true);
      try {
        const userJson = await SecureStore.getItemAsync('user_session');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (e) {
        console.error('Restoring token failed', e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email, password) => {
           setIsLoading(true);
           try {
             // --- REAL API MODE ---
             // if (email && password) {
             //    const data = await authService.login(email, password);
             //    const userObj = { name: data.user.name };
             //    setUser(userObj);
             //    await SecureStore.setItemAsync('user_session', JSON.stringify(userObj));
             // }

             // --- MOCK MODE ---
             console.log("Login Successful");
             const mockUser = { name: 'User' };
             setUser(mockUser);
             // Store session for Biometrics auto-login
             await SecureStore.setItemAsync('user_session', JSON.stringify(mockUser));

           } catch (error) {
             console.error("Login failed", error);
             // Alert.alert("Error", "Login failed");
           } finally {
             setIsLoading(false);
           }
        },
        signOut: () => {
          setUser(null);
          SecureStore.deleteItemAsync('user_session');
        },
        user,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
