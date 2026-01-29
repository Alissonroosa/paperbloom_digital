"use client";

import { QrCode, ScanLine } from "lucide-react";
import { motion } from "framer-motion";

export function GiftCardPreview() {
    return (
        <div className="relative w-full max-w-md mx-auto perspective-1000">
            {/* Background Card (Simulating the stack effect) */}
            <div className="absolute top-4 left-4 w-full h-full bg-[#FDF6F0] rounded-3xl shadow-lg -z-10 transform rotate-3 opacity-60" />

            {/* Main Card Container */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="bg-[#FDF6F0] p-6 md:p-8 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden"
            >
                {/* Floral Decorations (CSS Shapes for simplicity, could be SVGs) */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-red-100/30 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-green-100/30 rounded-full blur-2xl translate-x-1/3 translate-y-1/3" />

                {/* Card Content */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E6C2C2]/20 relative overflow-hidden aspect-[4/3] flex flex-col justify-between">
                    {/* Floral Corners (Simulated with absolute divs for now) */}
                    <div className="absolute top-0 left-0 w-24 h-24 bg-[url('https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=200&auto=format&fit=crop')] bg-contain bg-no-repeat opacity-40 mix-blend-multiply rotate-180" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[url('https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=200&auto=format&fit=crop')] bg-contain bg-no-repeat opacity-40 mix-blend-multiply -scale-x-100 rotate-180" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[url('https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=200&auto=format&fit=crop')] bg-contain bg-no-repeat opacity-40 mix-blend-multiply" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-[url('https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=200&auto=format&fit=crop')] bg-contain bg-no-repeat opacity-40 mix-blend-multiply -scale-x-100" />

                    <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center mt-4">
                        <h3 className="font-serif text-4xl text-[#8B5E5E] mb-2">Gift Card</h3>
                        <p className="font-script text-lg text-muted-foreground/80 max-w-[200px] leading-tight">
                            Uma mensagem especial espera por você.
                        </p>
                    </div>

                    <div className="relative z-10 flex justify-end items-end mt-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                            <QrCode className="w-16 h-16 text-gray-800" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Bottom Notification */}
                <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-gray-100">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                        <ScanLine className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">Escaneie para ver</p>
                        <p className="text-muted-foreground text-xs">Mensagem de Amor</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
