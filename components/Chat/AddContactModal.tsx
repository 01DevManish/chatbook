"use client";

import { useState } from "react";
import { ref, get, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/UI/Dialog";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { Search, UserPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchResult {
    uid: string;
    displayName: string;
    username?: string;
    email?: string;
    photoURL?: string;
    isContact?: boolean;
}

export default function AddContactModal({ isOpen, onClose }: AddContactModalProps) {
    const { user } = useAuth();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || !user) return;

        setLoading(true);
        setError("");
        setResult(null);
        setSuccess("");

        try {
            // We need to query users by email or username.
            // Since RTDB doesn't support complex text search efficiently without index,
            // we'll fetch all users and filter (for this scale). 
            // In producton, we would use a structured query or dedicated index.

            // Optimization: If it looks like an email, we might search differently?
            // For now, let's keep it simple: fetch all users (filtered by Sidebar logic usually) 
            // but here we need to find *anyone* not just contacts.

            // Actually, querying all users is bad for scale. 
            // But given the current setup in Sidebar does it, we'll replicate that limitation for now
            // or rely on 'orderByChild'.

            // Let's try to search efficiently if possible.
            // RTDB keys: users/{uid} -> { email: ..., username: ... }

            const usersRef = ref(rtdb, "users");
            const snapshot = await get(usersRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const foundUser = Object.values(data).find((u: any) =>
                    u.email?.toLowerCase() === query.toLowerCase() ||
                    u.username?.toLowerCase() === query.toLowerCase()
                ) as SearchResult | undefined;

                if (foundUser) {
                    if (foundUser.uid === user.uid) {
                        setError("You cannot add yourself.");
                    } else {
                        // Check if already a contact
                        const contactRef = ref(rtdb, `users/${user.uid}/contacts/${foundUser.uid}`);
                        const contactSnap = await get(contactRef);
                        setResult({
                            ...foundUser,
                            isContact: contactSnap.exists()
                        });
                    }
                } else {
                    setError("User not found.");
                }
            } else {
                setError("User not found.");
            }

        } catch (err) {
            console.error("Search error:", err);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddContact = async () => {
        if (!user || !result) return;
        setLoading(true);
        try {
            // Add to contacts: users/{myUid}/contacts/{theirUid} = true
            await set(ref(rtdb, `users/${user.uid}/contacts/${result.uid}`), true);
            setSuccess(`Added ${result.displayName} to contacts!`);
            setResult(prev => prev ? ({ ...prev, isContact: true }) : null);
            // Don't close immediately so they see the success message
            setTimeout(() => {
                // Optional: Clear or keep open?
                // onClose(); 
            }, 1500);
        } catch (err) {
            console.error("Add contact error:", err);
            setError("Failed to add contact.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white text-gray-900 border-gray-200">
                <DialogHeader>
                    <DialogTitle>Add Contact</DialogTitle>
                    <DialogDescription>
                        Search for a user by their email or username to start chatting.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSearch} className="flex gap-2 my-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Email or Username"
                        className="flex-1"
                    />
                    <Button type="submit" disabled={loading || !query.trim()}>
                        {loading && !result ? <Search className="animate-spin" size={18} /> : <Search size={18} />}
                    </Button>
                </form>

                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                {success && <p className="text-green-600 text-sm mt-1">{success}</p>}

                {result && (
                    <div className="mt-4 p-3 border rounded-lg flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                                {result.photoURL ? (
                                    <img src={result.photoURL} alt={result.displayName} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-gray-500 font-medium text-lg">{result.displayName?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">{result.displayName}</h4>
                                <p className="text-xs text-gray-500">{result.email}</p>
                            </div>
                        </div>

                        {result.isContact ? (
                            <Button variant="outline" size="sm" disabled className="text-green-600 border-green-200 bg-green-50">
                                <Check size={16} className="mr-1" /> Added
                            </Button>
                        ) : (
                            <Button size="sm" onClick={handleAddContact} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                                <UserPlus size={16} className="mr-1" /> Add
                            </Button>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
