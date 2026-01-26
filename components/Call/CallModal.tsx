"use client";

import { useEffect, useRef, useState } from "react";
import { useCall } from "@/context/CallContext";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, MonitorSmartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CallModal() {
    const {
        callState, callType, caller, acceptCall, rejectCall, endCall,
        localStream, remoteStream, toggleMic, toggleCamera, isMicOn, isCameraOn
    } = useCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Attach streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);


    if (callState === 'idle') return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] bg-gray-900 text-white flex flex-col items-center justify-center overflow-hidden">
                {/* Background Blur Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />

                {/* Incoming / Outgoing UI */}
                {(callState === 'incoming' || callState === 'outgoing') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 flex flex-col items-center gap-8"
                    >
                        {/* Avatar Pulsing */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700 bg-gray-800 relative z-10 shadow-2xl">
                                {caller?.photo ? (
                                    <img src={caller.photo} alt={caller.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                        {caller?.name?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-semibold tracking-tight">{caller?.name}</h2>
                            <p className="text-lg text-green-400 font-medium">
                                {callState === 'incoming' ? "Incoming Call..." : "Calling..."}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-12 mt-8">
                            {callState === 'incoming' ? (
                                <>
                                    <button
                                        onClick={rejectCall}
                                        className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors backdrop-blur-sm border border-red-500/20"
                                    >
                                        <PhoneOff size={32} />
                                    </button>
                                    <button
                                        onClick={acceptCall}
                                        className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-transform hover:scale-110 shadow-xl shadow-green-500/20 animate-bounce"
                                    >
                                        <Phone size={32} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={endCall}
                                    className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                                >
                                    <PhoneOff size={32} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Connected UI */}
                {callState === 'connected' && (
                    <motion.div className="absolute inset-0 w-full h-full">
                        {/* Remote Video (Full Screen) */}
                        {callType === 'video' ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover bg-black"
                            />
                        ) : (
                            // Audio Call UI
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 backdrop-blur-md z-0">
                                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-700 bg-gray-800 shadow-2xl mb-6">
                                    <img src={caller?.photo || ""} alt={caller?.name} className="w-full h-full object-cover" />
                                </div>
                                <h2 className="text-2xl font-semibold">{caller?.name}</h2>
                                <p className="text-gray-400 mt-2">00:00</p>
                            </div>
                        )}

                        {/* Local Video (Draggable/Floating) */}
                        {callType === 'video' && (
                            <div className="absolute right-4 top-4 w-24 h-36 sm:w-32 sm:h-48 bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-700/50 z-20">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover mirror"
                                />
                            </div>
                        )}

                        {/* Controls Overlay */}
                        <div className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-6 z-30">
                            <button
                                onClick={toggleMic}
                                className={`p-4 rounded-full backdrop-blur-md transition-colors ${!isMicOn ? 'bg-white text-gray-900' : 'bg-gray-800/60 text-white hover:bg-gray-700/60'}`}
                            >
                                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                            </button>

                            {callType === 'video' && (
                                <button
                                    onClick={toggleCamera}
                                    className={`p-4 rounded-full backdrop-blur-md transition-colors ${!isCameraOn ? 'bg-white text-gray-900' : 'bg-gray-800/60 text-white hover:bg-gray-700/60'}`}
                                >
                                    {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                                </button>
                            )}

                            <button
                                onClick={endCall}
                                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-105"
                            >
                                <PhoneOff size={28} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </AnimatePresence>
    );
}
