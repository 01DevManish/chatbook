"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Ensure user exists in Firestore
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (!userDoc.exists()) {
                        await setDoc(userDocRef, {
                            uid: user.uid,
                            displayName: user.displayName || "User",
                            email: user.email,
                            username: user.email?.split("@")[0].toLowerCase(),
                            photoURL: user.photoURL,
                            createdAt: serverTimestamp(),
                            lastSeen: serverTimestamp(),
                        });
                    } else {
                        // Backfill username if missing
                        if (!userDoc.data().username && user.email) {
                            await setDoc(userDocRef, {
                                username: user.email.split("@")[0].toLowerCase()
                            }, { merge: true });
                        }
                    }
                } catch (error) {
                    console.error("Error syncing user to Firestore:", error);
                }
            }
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
