"use client";

import { cn } from "@/lib/utils";

interface NotebookMockupProps {
    children: React.ReactNode;
    className?: string;
}

export function NotebookMockup({ children, className }: NotebookMockupProps) {
    return (
        <div className={cn("relative mx-auto", className)}>
            {/* Lid (Screen) */}
            <div className="relative bg-gray-800 rounded-t-xl border-[10px] border-gray-800 shadow-xl overflow-hidden aspect-[16/10]">
                <div className="w-full h-full bg-white overflow-y-auto scrollbar-hide">
                    {children}
                </div>
                {/* Camera */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3 bg-gray-800 rounded-b-md z-20 flex justify-center items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                </div>
            </div>

            {/* Base (Keyboard area) */}
            <div className="relative bg-gray-900 rounded-b-xl h-[20px] w-full shadow-lg">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[120px] h-[8px] bg-gray-700 rounded-b-md"></div>
            </div>
        </div>
    );
}
