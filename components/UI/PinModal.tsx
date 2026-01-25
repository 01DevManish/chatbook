"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
    isSettingPin?: boolean; // If true, we are setting a new PIN
}

export default function PinModal({ isOpen, onClose, onSuccess, title = "Enter Security PIN", isSettingPin = false }: PinModalProps) {
    const [pin, setPin] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    useEffect(() => {
        if (isOpen) {
            setPin(["", "", "", ""]);
            setError("");
            // Focus first input
            setTimeout(() => inputRefs[0].current?.focus(), 100);
        }
    }, [isOpen]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto focus next
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }

        // Auto submit if filled
        if (index === 3 && value) {
            const fullPin = newPin.join("");
            // This is a simplified demo logic. 
            // Ideally we verify against a stored hash.
            // For this demo, we'll use a hardcoded PIN '1234' for retrieval if not setting one.
            // OR we pass the verify logic up? No, let's keep it simple.

            if (isSettingPin) {
                // Logic to set PIN would go here (e.g. save to localStorage or Firestore)
                // For now, we assume success immediately for setting.
                onSuccess();
            } else {
                // Temporary hardcoded check for demo purposes
                if (newPin.join("") === "1234") {
                    onSuccess();
                } else {
                    setError("Incorrect PIN (Try 1234)");
                    setPin(["", "", "", ""]);
                    inputRefs[0].current?.focus();
                }
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-[#202c33] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 flex justify-between items-center border-b border-[#2a3942]">
                    <h3 className="text-[#e9edef] font-medium text-lg">{title}</h3>
                    <button onClick={onClose} className="text-[#aebac1] hover:text-[#e9edef]">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center">
                    <p className="text-[#8696a0] mb-6 text-center text-sm">
                        {isSettingPin ? "Create a 4-digit PIN to secure your chats." : "Enter your 4-digit PIN to retrieve messages."}
                    </p>

                    <div className="flex gap-4 mb-6">
                        {pin.map((digit, i) => (
                            <input
                                key={i}
                                ref={inputRefs[i]}
                                type="password"
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-14 bg-[#2a3942] border-b-2 border-[#00a884] text-center text-2xl text-white outline-none focus:border-[#25d366] focus:bg-[#111b21] rounded-t-md transition-colors"
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-[#f15c6d] text-sm font-medium animate-pulse">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
