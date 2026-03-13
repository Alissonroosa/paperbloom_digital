"use client";

import { Heart, Play, Pause, Image as ImageIcon, Music, Share2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function DesktopPreviewContent() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="flex flex-col min-h-full bg-[#FFF5F5] font-sans">
            {/* Header */}
            <header className="w-full py-4 px-8 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-primary fill-primary/20" />
                    </div>
                    <span className="font-serif font-bold text-text-main">Para Você</span>
                </div>
                <Button size="sm" variant="outline" className="rounded-full h-8 px-4 text-xs">
                    <Share2 className="w-3 h-3 mr-2" /> Compartilhar
                </Button>
            </header>

            <div className="flex-1 container mx-auto p-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                    {/* Left: Photo */}
                    <div className="relative">
                        <div className="aspect-[4/5] bg-white p-4 shadow-xl rotate-[-2deg] transform transition-transform hover:rotate-0 duration-500">
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-90 hover:scale-105 transition-transform duration-700"></div>
                                <span className="font-script text-3xl text-white drop-shadow-md relative z-10">Nossa Foto</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Message & Music */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="font-serif text-4xl text-text-accent mb-4">Para: Amor da Minha Vida</h1>
                            <div className="w-24 h-1 bg-primary/20 mb-6" />
                            <p className="font-script text-2xl text-text-main leading-relaxed">
                                "Cada momento ao seu lado é um presente que guardo no coração. Te amo mais que tudo!"
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-primary/10">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    {isPlaying ? <Pause className="w-6 h-6 text-primary" /> : <Play className="w-6 h-6 text-primary ml-1" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-sm font-medium text-text-main">Nossa Música Especial</div>
                                        <div className="text-xs text-muted-foreground">02:14</div>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                    </div>
                </div>

                {/* Gallery Preview */}
                <div className="mt-12">
                    <h3 className="font-serif text-xl text-text-main mb-6 text-center">Nossos Melhores Momentos</h3>
                    <div className="grid grid-cols-3 gap-4 opacity-70">
                        <div className="aspect-square bg-white rounded-lg shadow-sm"></div>
                        <div className="aspect-square bg-white rounded-lg shadow-sm"></div>
                        <div className="aspect-square bg-white rounded-lg shadow-sm"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
