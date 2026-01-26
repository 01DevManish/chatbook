"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/UI/Dialog";
import { useAuth } from "@/context/AuthContext";
import { rtdb, storage } from "@/lib/firebase";
import { ref, onValue, push, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Search, X, Camera, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UserData {
    uid: string;
    displayName?: string; // Optional because sometimes it might be missing
    email?: string;
    photoURL?: string;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<UserData[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [step, setStep] = useState<1 | 2>(1); // 1: Select Contacts, 2: Group Info
    const [loading, setLoading] = useState(false);
    const [groupImage, setGroupImage] = useState<File | null>(null);
    const [groupImagePreview, setGroupImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Contacts
    useEffect(() => {
        if (!user || !isOpen) return;

        // Reset state on open
        if (isOpen) {
            setStep(1);
            setGroupName("");
            setSelectedContacts([]);
            setGroupImage(null);
            setGroupImagePreview(null);
        }

        const contactsRef = ref(rtdb, `users/${user.uid}/contacts`);
        const unsubscribe = onValue(contactsRef, (snapshot) => {
            if (snapshot.exists()) {
                const contactIds = Object.keys(snapshot.val());
                // Fetch details for each contact
                const loadedContacts: UserData[] = [];
                let loadedCount = 0;

                contactIds.forEach((uid) => {
                    const userRef = ref(rtdb, `users/${uid}`);
                    onValue(userRef, (userSnap) => {
                        if (userSnap.exists()) {
                            // Avoid duplicates if real-time updates happen
                            // Ideally we should use 'once' or manage state more carefully, 
                            // but for now simplistic approach:
                            loadedContacts.push({ uid, ...userSnap.val() });
                        }
                        loadedCount++;
                        if (loadedCount === contactIds.length) {
                            // Remove duplicates based on UID just in case
                            const unique = Array.from(new Map(loadedContacts.map(item => [item.uid, item])).values());
                            setContacts(unique);
                        }
                    }, { onlyOnce: true });
                });
            } else {
                setContacts([]);
            }
        });

        return () => unsubscribe();
    }, [user, isOpen]);

    const handleSelectContact = (uid: string) => {
        setSelectedContacts(prev =>
            prev.includes(uid)
                ? prev.filter(id => id !== uid)
                : [...prev, uid]
        );
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setGroupImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setGroupImagePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCreateGroup = async () => {
        if (!user || !groupName.trim() || selectedContacts.length === 0) return;

        setLoading(true);
        try {
            // 1. Create Group ID
            const groupsRef = ref(rtdb, 'groups');
            const newGroupRef = push(groupsRef);
            const groupId = newGroupRef.key;

            if (!groupId) throw new Error("Failed to generate group ID");

            // 2. Upload Image if selected
            let photoURL = null;
            if (groupImage) {
                const imageRef = storageRef(storage, `group_images/${groupId}`);
                await uploadBytes(imageRef, groupImage);
                photoURL = await getDownloadURL(imageRef);
            }

            // 3. Prepare Group Data
            const participants = [user.uid, ...selectedContacts];
            const groupData = {
                id: groupId,
                name: groupName,
                photoURL: photoURL,
                createdBy: user.uid,
                createdAt: Date.now(),
                participants: participants.reduce((acc, uid) => ({ ...acc, [uid]: true }), {}),
                lastMessage: "Group created",
                lastMessageTimestamp: Date.now()
            };

            // 4. Save Group
            await set(newGroupRef, groupData);

            // 5. Add Group to each User's list
            // We can store a reference in users/{uid}/groups/{groupId} = true
            const updates: Record<string, any> = {};
            participants.forEach(uid => {
                updates[`users/${uid}/groups/${groupId}`] = true;
            });
            await update(ref(rtdb), updates);

            onClose();
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Failed to create group.");
        } finally {
            setLoading(false);
        }
    };

    // Needed import for 'update'
    const { update } = require("firebase/database");

    const filteredContacts = contacts.filter(c =>
        c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#222e35] text-[#e9edef] border border-[#2a3942] p-0 overflow-hidden">
                <DialogHeader className="bg-[#202c33] px-4 py-3 border-b border-[#2a3942]">
                    <DialogTitle className="text-[#e9edef] font-medium flex items-center">
                        {step === 1 ? "Add Group Participants" : "New Group"}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-0">
                    {step === 1 ? (
                        <>
                            {/* Search */}
                            <div className="px-3 py-2">
                                <div className="flex items-center bg-[#202c33] rounded-lg px-4 py-2">
                                    <Search size={18} className="text-[#8696a0] mr-4" />
                                    <input
                                        type="text"
                                        placeholder="Search contacts"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-transparent text-[#e9edef] placeholder-[#8696a0] text-sm outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Selected Chips */}
                            {selectedContacts.length > 0 && (
                                <div className="px-3 pb-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                    {selectedContacts.map(uid => {
                                        const contact = contacts.find(c => c.uid === uid);
                                        return (
                                            <div key={uid} className="flex items-center bg-[#2a3942] rounded-full pl-3 pr-1 py-1 text-sm">
                                                <span className="max-w-[100px] truncate">{contact?.displayName || "Unknown"}</span>
                                                <button onClick={() => handleSelectContact(uid)} className="ml-1 p-0.5 hover:bg-[#374248] rounded-full">
                                                    <X size={14} className="text-[#8696a0]" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Contact List */}
                            <div className="h-72 overflow-y-auto">
                                {filteredContacts.map(contact => (
                                    <div
                                        key={contact.uid}
                                        onClick={() => handleSelectContact(contact.uid)}
                                        className="flex items-center px-4 py-3 hover:bg-[#202c33] cursor-pointer"
                                    >
                                        <div className="relative mr-3">
                                            <div className="h-10 w-10 rounded-full bg-[#6b7c85] overflow-hidden flex items-center justify-center">
                                                {contact.photoURL ? (
                                                    <img src={contact.photoURL} alt={contact.displayName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-[#cfd8dc] font-medium text-lg">
                                                        {contact.displayName?.[0]?.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            {selectedContacts.includes(contact.uid) && (
                                                <div className="absolute -bottom-1 -right-1 bg-[#00a884] rounded-full p-0.5 border-2 border-[#111b21]">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[#e9edef] font-medium truncate">{contact.displayName}</h3>
                                            <p className="text-[#8696a0] text-sm truncate">{contact.email}</p>
                                        </div>
                                    </div>
                                ))}
                                {filteredContacts.length === 0 && (
                                    <div className="flex items-center justify-center h-full text-[#8696a0]">
                                        No contacts found
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="p-6 flex flex-col items-center">
                            {/* Image Upload */}
                            <div className="relative mb-6">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-24 w-24 rounded-full bg-[#2a3942] flex items-center justify-center cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
                                >
                                    {groupImagePreview ? (
                                        <img src={groupImagePreview} alt="Group" className="h-full w-full object-cover" />
                                    ) : (
                                        <Camera size={32} className="text-[#8696a0]" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                                <div className="absolute bottom-0 right-0 bg-[#00a884] rounded-full p-2 border-4 border-[#222e35]">
                                    <Camera size={14} className="text-white" />
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="w-full">
                                <input
                                    type="text"
                                    placeholder="Group Subject"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-[#00a884] items-center text-[#e9edef] placeholder-[#8696a0] py-2 focus:outline-none text-center text-lg"
                                    autoFocus
                                />
                                <div className="text-right mt-2 text-[#8696a0] text-xs">
                                    Participants: {selectedContacts.length}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-[#202c33] flex justify-between items-center">
                    {step === 1 ? (
                        <div className="w-full flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                disabled={selectedContacts.length === 0}
                                className="bg-[#00a884] text-[#111b21] px-4 py-2 rounded-full font-medium hover:bg-[#06cf9c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    ) : (
                        <div className="w-full flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="text-[#00a884] px-4 py-2 font-medium hover:text-[#06cf9c] transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                disabled={!groupName.trim() || loading}
                                className="bg-[#00a884] text-[#111b21] px-6 py-2 rounded-full font-medium hover:bg-[#06cf9c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-[#111b21] border-t-transparent rounded-full animate-spin mr-2"></div>}
                                Create
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
