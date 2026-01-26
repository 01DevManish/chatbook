"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div
                className="absolute inset-0"
                onClick={() => onOpenChange(false)}
            />
            {children}
        </div>
    );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DialogContent({ className, children, ...props }: DialogContentProps) {
    // We need to access the close handler from context if we wanted a close button inside,
    // but for now we'll just render it. 
    // Ideally we'd use a Context for this composition pattern.
    return (
        <div
            className={cn("relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg animate-in zoom-in-95 duration-200", className)}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
            {...props}
        >
            {/* Optional Close Button could go here if passed via context */}
            {children}
        </div>
    );
}

export function DialogHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props}>
            {children}
        </div>
    );
}

export function DialogTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
            {children}
        </h3>
    );
}

export function DialogDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn("text-sm text-gray-500", className)} {...props}>
            {children}
        </p>
    );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                className
            )}
            {...props}
        />
    );
}
