"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/UI/Dialog";
import { X, Camera, Edit2, User, Image as ImageIcon, ChevronLeft, Check, Moon, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, update } from "firebase/database";
import { rtdb, db, storage, auth } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

// DiceBear Avatar Collections
const AVATAR_STYLES = [
    "adventurer",
    "avataaars",
    "big-ears",
    "bottts",
    "fun-emoji",
    "lorelei",
    "notionists",
    "open-peeps",
    "pixel-art",
    "thumbs"
];

const PREDEFINED_AVATARS = [
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Jack",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Jocelyn",
    "https://api.dicebear.com/9.x/lorelei/svg?seed=Sasha",
    "https://api.dicebear.com/9.x/lorelei/svg?seed=Sam",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Leo",
    "https://api.dicebear.com/9.x/notionists/svg?seed=Mila",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=Alex",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=Micah",
    "https://api.dicebear.com/9.x/bottts/svg?seed=Bot1",
    "https://api.dicebear.com/9.x/bottts/svg?seed=Bot2",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Happy",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Cool",
    "https://api.dicebear.com/9.x/big-ears/svg?seed=Buddy"
];

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAbout?: string;
}

export default function SettingsModal({ isOpen, onClose, currentAbout = "Hey there! I am using Chatbook." }: SettingsModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [view, setView] = useState<"main" | "profile" | "avatars">("main");

    // Profile State
    const [displayName, setDisplayName] = useState("");
    const [about, setAbout] = useState(currentAbout);
    const [loading, setLoading] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            // Ideally fetch 'about' from user profile prop if available, 
            // but for now we rely on the prop passed from Sidebar which fetches it.
        }
    }, [user, isOpen]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Update Auth Profile
            if (displayName !== user.displayName) {
                await updateProfile(user, { displayName });
            }

            // Update DBs
            const updates: any = { displayName, about };

            // If avatar changed via selection
            if (selectedAvatar) {
                updates.photoURL = selectedAvatar;
                await updateProfile(user, { photoURL: selectedAvatar });
            }

            await updateDoc(doc(db, "users", user.uid), updates);
            await update(ref(rtdb, `users/${user.uid}`), updates);

            setView("main");
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            setLoading(true);
            try {
                const imageRef = storageRef(storage, `profile_images/${user.uid}`);
                await uploadBytes(imageRef, file);
                const downloadURL = await getDownloadURL(imageRef);

                setSelectedAvatar(downloadURL);
                await updateProfile(user, { photoURL: downloadURL });
                await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });
                await update(ref(rtdb, `users/${user.uid}`), { photoURL: downloadURL });

                setView("profile"); // Go back to profile view
            } catch (error) {
                console.error("Error uploading image:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/login");
    };

    if (!user) return null;

    // Render Logic
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#111b21] text-[#e9edef] border border-[#2a3942] p-0 overflow-hidden h-[85vh] sm:h-auto flex flex-col">

                {/* Header */}
                <div className="bg-[#202c33] px-4 py-3 flex items-center space-x-3 border-b border-[#2a3942]">
                    {view !== "main" ? (
                        <button onClick={() => setView(view === "avatars" ? "profile" : "main")} className="p-1 -ml-2 rounded-full hover:bg-[#374248]">
                            <ChevronLeft size={24} className="text-[#aebac1]" />
                        </button>
                    ) : (
                        <div className="w-8" /> // Spacer
                    )}
                    <h2 className="text-xl font-medium text-[#e9edef] flex-1">
                        {view === "main" ? "Settings" : view === "profile" ? "Profile" : "Choose Avatar"}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[#374248]">
                        <X size={24} className="text-[#aebac1]" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0">

                    {/* MAIN VIEW */}
                    {view === "main" && (
                        <div className="py-2">
                            {/* Profile Card */}
                            <div
                                onClick={() => setView("profile")}
                                className="flex items-center px-4 py-4 hover:bg-[#202c33] cursor-pointer transition-colors"
                            >
                                <div className="h-16 w-16 rounded-full bg-[#6b7c85] overflow-hidden mr-4 border border-[#2a3942]">
                                    <img src={user.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.displayName}`} alt="Profile" className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-[#e9edef]">{user.displayName}</h3>
                                    <p className="text-[#8696a0] text-sm truncate">{about}</p>
                                </div>
                            </div>

                            <div className="border-b border-[#2a3942] my-2 opacity-50" />

                            {/* Menu Items */}
                            <div className="px-4 py-3 hover:bg-[#202c33] cursor-pointer flex items-center mb-1">
                                <Moon size={22} className="text-[#8696a0] mr-6" />
                                <div className="flex-1">
                                    <h3 className="text-[#e9edef]">Theme</h3>
                                    <p className="text-[#8696a0] text-sm">Dark (Default)</p>
                                </div>
                            </div>

                            <div className="px-4 py-3 hover:bg-[#202c33] cursor-pointer flex items-center mb-1">
                                <ImageIcon size={22} className="text-[#8696a0] mr-6" />
                                <div className="flex-1">
                                    <h3 className="text-[#e9edef]">Chat Wallpaper</h3>
                                    <p className="text-[#8696a0] text-sm">Change default background</p>
                                </div>
                            </div>

                            <div className="border-b border-[#2a3942] my-2 opacity-50" />

                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-4 hover:bg-[#202c33] cursor-pointer flex items-center text-[#ea4335]"
                            >
                                <LogOut size={22} className="mr-6" />
                                <div className="flex-1 text-left">
                                    <h3 className="font-medium">Logout</h3>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* PROFILE EDIT VIEW */}
                    {view === "profile" && (
                        <div className="pb-10 animate-in slide-in-from-right duration-200">
                            {/* Avatar Section */}
                            <div className="flex justify-center py-8 relative group">
                                <div className="relative">
                                    <div className="h-40 w-40 rounded-full bg-[#6b7c85] overflow-hidden border-4 border-[#111b21]">
                                        <img src={selectedAvatar || user.photoURL || ""} alt="Profile" className="h-full w-full object-cover" />
                                    </div>
                                    <button
                                        onClick={() => setView("avatars")}
                                        className="absolute bottom-1 right-1 bg-[#00a884] p-3 rounded-full text-white shadow-lg hover:bg-[#008f6f] transition-all"
                                    >
                                        <Camera size={22} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Fields */}
                            <div className="px-6 space-y-6">
                                {/* Name */}
                                <div className="space-y-3">
                                    <div className="flex items-center text-[#00a884] text-sm font-medium">
                                        <User size={16} className="mr-2" />
                                        <span>Name</span>
                                    </div>
                                    <div className="flex items-center border-b-2 border-[#2a3942] focus-within:border-[#00a884] py-1 transition-colors">
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="bg-transparent w-full text-[#e9edef] focus:outline-none text-base pb-1"
                                            placeholder="Your Name"
                                        />
                                        <Edit2 size={18} className="text-[#8696a0] ml-2" />
                                    </div>
                                    <p className="text-[#8696a0] text-xs">
                                        This is not your username or pin. This name will be visible to your contacts.
                                    </p>
                                </div>

                                {/* About */}
                                <div className="space-y-3">
                                    <div className="flex items-center text-[#00a884] text-sm font-medium">
                                        <span className="text-lg mr-2 leading-none">ℹ️</span>
                                        <span>About</span>
                                    </div>
                                    <div className="flex items-center border-b-2 border-[#2a3942] focus-within:border-[#00a884] py-1 transition-colors">
                                        <input
                                            type="text"
                                            value={about}
                                            onChange={(e) => setAbout(e.target.value)}
                                            className="bg-transparent w-full text-[#e9edef] focus:outline-none text-base pb-1"
                                            placeholder="Hey there! I am using Chatbook."
                                        />
                                        <Edit2 size={18} className="text-[#8696a0] ml-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="px-6 mt-8">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="w-full bg-[#00a884] text-[#111b21] font-bold py-3 rounded-full hover:bg-[#008f6f] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span>Saving...</span>
                                    ) : (
                                        <>
                                            <Check size={20} />
                                            Save Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* AVATAR SELECTOR VIEW */}
                    {view === "avatars" && (
                        <div className="p-4 animate-in slide-in-from-right duration-200">
                            <h3 className="text-[#8696a0] text-sm font-medium mb-4 uppercase tracking-wider">Choose an Avatar</h3>

                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {/* Upload Option */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-full bg-[#2a3942] flex items-center justify-center cursor-pointer hover:bg-[#374248] transition-colors border-2 border-dashed border-[#8696a0]"
                                >
                                    <div className="flex flex-col items-center justify-center text-[#8696a0]">
                                        <Camera size={28} className="mb-1" />
                                        <span className="text-[10px] uppercase">Upload</span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                {/* Predefined Avatars */}
                                {PREDEFINED_AVATARS.map((url, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setSelectedAvatar(url);
                                            setView("profile"); // Return to profile with selection
                                        }}
                                        className="aspect-square rounded-full bg-[#202c33] overflow-hidden cursor-pointer hover:ring-4 ring-[#00a884] transition-all"
                                    >
                                        <img src={url} alt={`Avatar ${idx}`} className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
