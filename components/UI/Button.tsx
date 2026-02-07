import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "btn-whatsapp",
            secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-[#2a3942] dark:text-white dark:hover:bg-[#3a4a54]",
            outline: "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-[#2a3942] focus:ring-[#00a884] text-gray-700 dark:text-white",
            ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-[#2a3942] text-gray-700 dark:text-white",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2.5 text-base",
            lg: "px-6 py-3 text-lg",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a884] disabled:opacity-60 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {loading && (
                    <span className="spinner" />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
