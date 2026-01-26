import { X, Download, ExternalLink } from "lucide-react";

interface ImageModalProps {
    src: string | null;
    onClose: () => void;
}

export default function ImageModal({ src, onClose }: ImageModalProps) {
    if (!src) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            {/* Toolbar */}
            <div className="absolute top-0 inset-x-0 p-4 flex justify-end items-center gap-4 z-50 bg-gradient-to-b from-black/60 to-transparent">
                <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Open Original"
                >
                    <ExternalLink size={24} />
                </a>
                <button
                    onClick={onClose}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={28} />
                </button>
            </div>

            {/* Image */}
            <div className="w-full h-full p-4 flex items-center justify-center overflow-hidden" onClick={onClose}>
                <img
                    src={src}
                    alt="Full screen view"
                    className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-200"
                    onClick={(e) => e.stopPropagation()} // Prevent close on image click
                />
            </div>
        </div>
    );
}
