import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils exists, or use clsx/tailwind-merge directly

interface VoiceRecorderProps {
    onSend: (audioBlob: Blob) => void;
    onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startRecording();
        return () => {
            stopRecordingContext();
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            onCancel(); // Exit if mic fails
        }
    };

    const stopRecordingContext = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const handleSend = () => {
        if (!mediaRecorderRef.current) return;

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            onSend(blob);
        };
        stopRecordingContext();
    };

    const handleCancel = () => {
        stopRecordingContext();
        onCancel();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex-1 flex items-center gap-2 bg-[var(--whatsapp-input-bg)] rounded-2xl px-2 py-1.5 sm:py-2 border border-transparent animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
                onClick={handleCancel}
                className="p-2 text-[var(--whatsapp-text-secondary)] hover:text-[#ea4335] transition-colors"
                title="Cancel"
            >
                <Trash2 size={20} />
            </button>

            <div className="flex-1 flex items-center gap-2 ml-2">
                <div className="w-2 h-2 rounded-full bg-[#ea4335] animate-pulse" />
                <span className="text-[var(--whatsapp-text-primary)] font-medium tabular-nums min-w-[50px]">
                    {formatTime(duration)}
                </span>
                <span className="text-[var(--whatsapp-text-secondary)] text-sm animate-pulse hidden sm:inline">
                    Recording...
                </span>
            </div>

            <button
                onClick={handleSend}
                className="p-2 bg-[var(--whatsapp-green)] text-white rounded-full hover:bg-[var(--whatsapp-green-dark)] transition-colors shadow-sm flex items-center justify-center w-10 h-10"
                title="Send Voice Message"
            >
                <Send size={20} className="ml-0.5" />
            </button>
        </div>
    );
}
