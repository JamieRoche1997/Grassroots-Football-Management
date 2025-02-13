import { createContext } from 'react';
import { User } from 'firebase/auth';

// Define the context type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  clubName: string | null;
  ageGroup: string | null;
  division: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setUserData: (data: Partial<AuthContextType>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
