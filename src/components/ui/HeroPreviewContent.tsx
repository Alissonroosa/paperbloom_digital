"use client";

import { Heart, Music, Play, Pause } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export function HeroPreviewContent() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="flex flex-col items-center min-h-full bg-[#FFF5F5] p-6 text-center pb-20">
            <div className="w-full flex justify-center mb-6 mt-8">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Heart className="w-6 h-6 text-primary fill-primary/20" />
                </div>
            </div>

            <h3 className="font-serif text-2xl text-text-accent mb-2">Para: Amor da Minha Vida</h3>
            <div className="w-16 h-0.5 bg-primary/20 mb-8 mx-auto" />

            <div className="w-full aspect-[4/5] bg-white p-3 shadow-lg rotate-1 mb-8 transform transition-transform hover:rotate-0 duration-500">
                <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    {/* Placeholder for user photo */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-90 hover:scale-105 transition-transform duration-700"></div>
                    <span className="font-script text-2xl text-white drop-shadow-md relative z-10">Nossa Foto</span>
                </div>
            </div>

            <p className="font-script text-xl text-text-main mb-8 leading-relaxed">
                "Cada momento ao seu lado é um presente que guardo no coração. Te amo mais que tudo!"
            </p>

            <div className="w-full bg-white rounded-xl p-4 shadow-sm mb-8 border border-primary/10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="w-5 h-5 text-primary" /> : <Play className="w-5 h-5 text-primary ml-1" />}
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Nossa Música Especial</div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: isPlaying ? "100%" : "30%" }}
                                transition={{ duration: 30, ease: "linear", repeat: isPlaying ? Infinity : 0 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-sm text-muted-foreground/60 font-light">
                Role para ver mais ❤️
            </div>

            {/* Extra content to enable scrolling */}
            <div className="mt-8 space-y-4 w-full opacity-50">
                <div className="h-24 bg-white rounded-lg w-full"></div>
                <div className="h-24 bg-white rounded-lg w-full"></div>
            </div>
        </div>
    );
}
