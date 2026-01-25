"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, get, set, serverTimestamp } from "firebase/database";
import { auth, rtdb } from "@/lib/firebase";

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
                // Ensure user exists in Realtime Database
                try {
                    const userRef = ref(rtdb, `users/${user.uid}`);
                    const snapshot = await get(userRef);

                    if (!snapshot.exists()) {
                        await set(userRef, {
                            uid: user.uid,
                            displayName: user.displayName || "User",
                            email: user.email,
                            username: user.email?.split("@")[0].toLowerCase(),
                            photoURL: user.photoURL,
                            createdAt: Date.now(),
                            lastSeen: Date.now(),
                        });
                        console.log("User saved to Realtime Database");
                    } else {
                        // Update lastSeen
                        await set(ref(rtdb, `users/${user.uid}/lastSeen`), Date.now());

                        // Backfill username if missing
                        const userData = snapshot.val();
                        if (!userData.username && user.email) {
                            await set(ref(rtdb, `users/${user.uid}/username`), user.email.split("@")[0].toLowerCase());
                        }
                    }
                } catch (error) {
                    console.error("Error syncing user to Realtime Database:", error);
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

