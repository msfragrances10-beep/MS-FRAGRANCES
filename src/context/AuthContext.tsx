import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
import { User, Role } from '@/src/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            // Ensure msfragrances10@gmail.com is always an admin
            if (firebaseUser.email === 'msfragrances10@gmail.com' && userData.role !== 'admin') {
              const updatedUser = { ...userData, role: 'admin' as Role };
              await setDoc(userDocRef, updatedUser, { merge: true });
              setUser(updatedUser);
            } else {
              setUser(userData);
            }
          } else {
            // Create new user document
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              username: firebaseUser.email?.split('@')[0] || 'user',
              email: firebaseUser.email || '',
              role: firebaseUser.email === 'msfragrances10@gmail.com' ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
            };
            try {
              await setDoc(userDocRef, newUser);
              setUser(newUser);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.role === 'admin';

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    try {
      await setDoc(userDocRef, { ...user, ...data }, { merge: true });
      setUser({ ...user, ...data });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
