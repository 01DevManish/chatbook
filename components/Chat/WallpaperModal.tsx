"use client";

import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/UI/Dialog";
import { cn } from "@/lib/utils";

interface WallpaperModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    currentWallpaper?: string;
}

const WALLPAPERS = [
    "/wallpapers/wp1.jpg",
    "/wallpapers/wp2.png",
    "/wallpapers/wp3.png",
    "/wallpapers/wp4.png",
    "/wallpapers/wp5.png",
    // Default option to remove wallpaper
    "default"
];

export default function WallpaperModal({ isOpen, onClose, onSelect, currentWallpaper }: WallpaperModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>Chat Wallpaper</DialogTitle>
                    <DialogDescription>
                        Select a background for your chats.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-2 mt-4">
                    {WALLPAPERS.map((wp, index) => {
                        const isDefault = wp === "default";
                        return (
                            <div
                                key={wp}
                                onClick={() => {
                                    onSelect(isDefault ? "" : wp);
                                    onClose();
                                }}
                                className={cn(
                                    "aspect-[9/16] cursor-pointer rounded-lg overflow-hidden border-2 transition-all relative",
                                    (currentWallpaper === wp || (isDefault && !currentWallpaper))
                                        ? "border-green-500 ring-2 ring-green-500/20"
                                        : "border-transparent hover:border-gray-300"
                                )}
                            >
                                {isDefault ? (
                                    <div className="w-full h-full bg-[#0b141a] flex items-center justify-center text-gray-400 text-xs font-medium">
                                        Default
                                    </div>
                                ) : (
                                    <img
                                        src={wp}
                                        alt={`Wallpaper ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
