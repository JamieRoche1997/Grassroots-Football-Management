import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { getProfile } from '../services/profile';
import { AuthContext, AuthContextType } from './AuthContextObject';

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserDataState] = useState<Omit<AuthContextType, 'user' | 'loading'>>({
    uid: null,
    email: null,
    name: null,
    clubName: null,
    ageGroup: null,
    division: null,
    role: null,
    isAuthenticated: false,
    setUserData: () => {},
  });

  // Memoize `setUserData` so it doesn't change on every render
  const setUserData = useCallback((data: Partial<AuthContextType>) => {
    setUserDataState((prevData) => ({
      ...prevData,
      ...data,
      setUserData,
    }));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);

        try {
          const email = currentUser.email;
          if (email) {
            const { clubName, ageGroup, division, role} = await getProfile(email);
            const { name } = await getProfile(currentUser.email);
            setUserData({
              name,
              email,
              uid: currentUser.uid,
              clubName,
              ageGroup,
              division,
              role,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Error retrieving user data:', error);
        }
      } else {
        setUser(null);
        setUserData({
          name: null,
          email: null,
          uid: null,
          clubName: null,
          ageGroup: null,
          division: null,
          role: null,
          isAuthenticated: false,
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUserData]); // ✅ Remove `user` from the dependency array

  return (
    <AuthContext.Provider value={{ user, loading, ...userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
