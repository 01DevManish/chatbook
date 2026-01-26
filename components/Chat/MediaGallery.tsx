import { useState } from "react";
import { Message } from "./ChatWindow";
import { X, Image as ImageIcon } from "lucide-react";

interface MediaGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onImageClick: (src: string) => void;
}

export default function MediaGallery({ isOpen, onClose, messages, onImageClick }: MediaGalleryProps) {
    const mediaMessages = messages.filter(msg => msg.image).reverse(); // Newest first

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#111b21] w-full max-w-2xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-[#202c33] border-b border-[#2a3942]">
                    <h2 className="text-[#e9edef] font-medium text-lg flex items-center gap-2">
                        <ImageIcon size={20} className="text-[#00a884]" />
                        Media Gallery
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#aebac1] hover:bg-[#374248] rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {mediaMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#8696a0] gap-2">
                            <ImageIcon size={48} className="opacity-20" />
                            <p>No media shared yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {mediaMessages.map((msg) => (
                                <div key={msg.id} className="aspect-square relative group overflow-hidden rounded-lg bg-[#202c33] border border-[#2a3942]">
                                    <img
                                        src={msg.image!}
                                        alt="Shared media"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                                        loading="lazy"
                                        onClick={() => onImageClick(msg.image!)}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[10px] text-white/90">
                                            {new Date(msg.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
