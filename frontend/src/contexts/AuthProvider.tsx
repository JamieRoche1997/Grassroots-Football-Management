import React, { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { getProfile } from "../services/profile";
import { AuthContext, AuthContextType } from "./AuthContextObject";

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserDataState] = useState<
    Omit<AuthContextType, "user" | "loading">
  >({
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

  // Try to restore user data from localStorage if available
  useEffect(() => {
    try {
      const savedUserData = localStorage.getItem('userData');
      if (savedUserData) {
        const parsedData = JSON.parse(savedUserData);
        console.log("Auth: Restored user data from localStorage", parsedData);
        setUserDataState(prevState => ({
          ...prevState,
          ...parsedData,
          setUserData
        }));
      }
    } catch (error) {
      console.error("Failed to restore user data from localStorage", error);
    }
  }, []);

  // Memoize `setUserData` so it doesn't change on every render
  const setUserData = useCallback((data: Partial<AuthContextType>) => {
    console.log("Auth context updating user data:", data);
    setUserDataState((prevData) => {
      const newData = {
        ...prevData,
        ...data,
        setUserData,
      };
      
      // Save to localStorage for persistence across refreshes
      try {
        const dataToSave = { ...newData } as Omit<AuthContextType, 'setUserData'>;
        // Create a new object without the function property
        const dataForStorage = { 
          name: dataToSave.name,
          email: dataToSave.email,
          uid: dataToSave.uid,
          clubName: dataToSave.clubName,
          ageGroup: dataToSave.ageGroup,
          division: dataToSave.division,
          role: dataToSave.role,
          isAuthenticated: dataToSave.isAuthenticated
        };
        localStorage.setItem('userData', JSON.stringify(dataForStorage));
      } catch (error) {
        console.error("Failed to save user data to localStorage", error);
      }
      
      return newData;
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const email = currentUser.email;
          if (email) {
            // Get role from Firebase auth token
            const idTokenResult = await currentUser.getIdTokenResult();
            const role =
              typeof idTokenResult.claims.role === "string"
                ? idTokenResult.claims.role
                : "player"; // Default to player if role is missing
            
            // Get user profile with membership info
            const { clubName, ageGroup, division } = await getProfile(email);
            const { name } = await getProfile(currentUser.email);
            
            console.log("Auth: Setting user data from profile", { name, clubName, ageGroup, division, role });
            
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
          console.error("Error retrieving user data:", error);
        } finally {
          // Always finish loading, even if there was an error
          setLoading(false);
        }
      } else {
        // User is signed out
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
        
        // Clear localStorage when signed out
        localStorage.removeItem('userData');
        
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUserData]); 

  return (
    <AuthContext.Provider value={{ user, loading, ...userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
