"use client";

import { CinematicPreview, PreviewStage } from "@/components/editor/CinematicPreview";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function TestCinematicPreviewPage() {
    const [stage, setStage] = useState<PreviewStage>("intro-1");
    const [autoPlay, setAutoPlay] = useState(false);

    const testData = {
        title: "Feliz Aniversário, Meu Amor!",
        specialDate: new Date('2024-11-23'),
        mainImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop",
        galleryImages: [
            "https://images.unsplash.com/photo-1522673607200-1645062cd958?q=80&w=2000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2069&auto=format&fit=crop"
        ],
        from: "João",
        to: "Maria",
        message: "Não importa quanto tempo passe, cada momento ao seu lado continua sendo o meu presente favorito. Obrigado por ser minha companheira, minha amiga e o amor da minha vida.",
        signature: "Seu Eterno Apaixonado",
        closing: "Que este novo ano seja repleto de alegrias e realizações",
        youtubeLink: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    };

    const stages: PreviewStage[] = [
        "intro-1", "intro-2", "intro-action", "transition", "reveal-photo",
        "reveal-intro", "reveal-message", "reading", "closing-1", "closing-2",
        "final", "full-view"
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Controls */}
            <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl font-bold mb-4">CinematicPreview Test Page</h1>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setAutoPlay(!autoPlay)}
                                variant={autoPlay ? "primary" : "outline"}
                                size="sm"
                            >
                                {autoPlay ? "Auto-Play ON" : "Auto-Play OFF"}
                            </Button>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <div className="flex gap-2">
                                {stages.map((s) => (
                                    <Button
                                        key={s}
                                        onClick={() => setStage(s)}
                                        variant={stage === s ? "primary" : "outline"}
                                        size="sm"
                                        className="whitespace-nowrap"
                                    >
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                        Current Stage: <span className="font-mono font-bold">{stage}</span>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="pt-32">
                <CinematicPreview
                    data={testData}
                    stage={stage}
                    onStageChange={setStage}
                    autoPlay={autoPlay}
                />
            </div>
        </div>
    );
}
