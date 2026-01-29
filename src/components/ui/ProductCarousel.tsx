"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calendar, ChevronLeft, ChevronRight, Heart, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const products = [
    {
        id: "digital-message",
        badge: "Mais Popular",
        badgeVariant: "secondary",
        title: "Mensagem Digital",
        description: "Uma experiência única e emocionante. Crie uma página personalizada com foto, música e uma mensagem que toca o coração. Ideal para surpreender quem você ama com um gesto inesquecível.",
        features: "Perfeito para qualquer ocasião especial",
        icon: Heart,
        rightContent: {
            number: "1",
            title: "Momento Único",
            subtitle: "Simples. Emocionante.",
            bgClass: "bg-[#FDF2F8]", // Pinkish
            textClass: "text-primary"
        },
        buttonText: "Criar Minha Mensagem",
        href: "/editor",
        price: "R$ 19,90"
    },
    {
        id: "12-letters",
        badge: "Produto Premium",
        badgeVariant: "default",
        title: "12 Cartas para Momentos Especiais",
        description: "Uma jornada emocional única. O presenteado recebe 12 mensagens exclusivas que só podem ser abertas uma única vez, criando um calendário de mistério e emoção ao longo do ano.",
        features: "Perfeito para aniversários, namoro ou datas especiais",
        icon: Calendar,
        rightContent: {
            number: "12",
            title: "Momentos Únicos",
            subtitle: "Uma Vez. Inesquecível.",
            bgClass: "bg-[#E6C2C2]", // Primary color
            textClass: "text-white"
        },
        buttonText: "Criar Minhas 12 Cartas",
        href: "/editor?type=12letters",
        price: "R$ 49,90",
        comingSoon: true
    }
];

export function ProductCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    const Icon = products[currentIndex].icon;

    return (
        <div className="relative w-full max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-3xl shadow-2xl bg-white min-h-[500px] md:min-h-[450px] relative">
                {/* Coming Soon Badge */}
                {products[currentIndex].comingSoon && (
                    <div className="absolute top-8 right-8 z-30">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full shadow-lg font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Em Breve
                        </div>
                    </div>
                )}
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row h-full"
                    >
                        {/* Left Content */}
                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
                            <div className="mb-6">
                                <Badge
                                    variant={products[currentIndex].badgeVariant as "default" | "secondary"}
                                    className="px-4 py-1.5 text-sm font-medium rounded-full mb-4"
                                >
                                    {products[currentIndex].badge === "Produto Premium" && <Sparkles className="w-3 h-3 mr-2 inline" />}
                                    {products[currentIndex].badge === "Mais Popular" && <Star className="w-3 h-3 mr-2 inline" />}
                                    {products[currentIndex].badge}
                                </Badge>
                                <h3 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-6 leading-tight">
                                    {products[currentIndex].title}
                                </h3>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-8 font-light">
                                    {products[currentIndex].description}
                                </p>

                                <div className="flex items-center gap-3 text-text-main/80 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span className="text-sm font-medium">{products[currentIndex].features}</span>
                                </div>

                                {products[currentIndex].comingSoon ? (
                                    <Button 
                                        size="lg" 
                                        className="w-full md:w-auto px-8 py-6 text-lg rounded-xl shadow-lg cursor-not-allowed opacity-60"
                                        disabled
                                    >
                                        Em Breve
                                        <Sparkles className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Link href={products[currentIndex].href}>
                                        <Button 
                                            size="lg" 
                                            className="w-full md:w-auto px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                                        >
                                            {products[currentIndex].buttonText}
                                            <span className="ml-2 text-sm opacity-80 font-normal">({products[currentIndex].price})</span>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className={cn(
                            "flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden",
                            products[currentIndex].rightContent.bgClass
                        )}>
                            {/* Decorative Circle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <span className={cn(
                                    "font-script text-[120px] md:text-[180px] leading-none block opacity-90",
                                    products[currentIndex].id === "12-letters" ? "text-[#4A4A4A]" : "text-primary"
                                )}>
                                    {products[currentIndex].rightContent.number}
                                </span>
                                <h4 className={cn(
                                    "font-serif text-3xl md:text-4xl font-bold mb-2",
                                    products[currentIndex].id === "12-letters" ? "text-[#4A4A4A]" : "text-text-main"
                                )}>
                                    {products[currentIndex].rightContent.title}
                                </h4>
                                <p className={cn(
                                    "text-xl font-light opacity-80",
                                    products[currentIndex].id === "12-letters" ? "text-[#4A4A4A]" : "text-text-main"
                                )}>
                                    {products[currentIndex].rightContent.subtitle}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-20">
                <Button
                    variant="outline"
                    onClick={prevSlide}
                    className="rounded-full w-12 h-12 p-0 bg-white shadow-lg hover:bg-gray-50 border-none flex items-center justify-center"
                >
                    <ChevronLeft className="w-6 h-6 text-text-main" />
                </Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-20">
                <Button
                    variant="outline"
                    onClick={nextSlide}
                    className="rounded-full w-12 h-12 p-0 bg-white shadow-lg hover:bg-gray-50 border-none flex items-center justify-center"
                >
                    <ChevronRight className="w-6 h-6 text-text-main" />
                </Button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {products.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                            "w-3 h-3 rounded-full transition-all duration-300",
                            currentIndex === index ? "bg-primary w-8" : "bg-primary/20 hover:bg-primary/40"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
