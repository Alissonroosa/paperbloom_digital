"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Heart, Calendar, Baby, ChevronDown } from "lucide-react"

const PRODUCTS = [
    { name: "Mensagem Digital", href: "/mensagem-digital", icon: Heart, description: "Foto, música e mensagem" },
    { name: "12 Cartas", href: "/12-cartas", icon: Calendar, description: "12 momentos inesquecíveis" },
    { name: "Revelação Virtual", href: "/revelacao-virtual", icon: Baby, description: "Menino ou menina?" },
]

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [productsOpen, setProductsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setProductsOpen(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setProductsOpen(false), 200)
    }

    return (
        <header
            className={cn(
                "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[85%] max-w-5xl rounded-full transition-all duration-500 ease-in-out",
                isScrolled
                    ? "border border-white/20 bg-white/70 backdrop-blur-md shadow-lg shadow-black/5 py-2"
                    : "bg-transparent border-transparent py-4"
            )}
        >
            <div className="container flex h-12 items-center justify-between px-6">
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className={cn(
                        "p-0.5 rounded-full transition-colors duration-300",
                        isScrolled ? "bg-primary/10" : "bg-white/50 backdrop-blur-sm"
                    )}>
                        <Image 
                            src="/logo-icon.png" 
                            alt="Paper Bloom" 
                            width={38} 
                            height={38} 
                            className="transition-transform duration-300 group-hover:rotate-45"
                        />
                    </div>
                    <span className={cn(
                        "font-serif text-lg font-bold tracking-tight transition-colors duration-300",
                        isScrolled ? "text-text-main" : "text-text-main"
                    )}>
                        Paper Bloom
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/" className="text-text-main/80 hover:text-primary transition-colors">
                        Início
                    </Link>
                    <Link href="/#how-it-works" className="text-text-main/80 hover:text-primary transition-colors">
                        Como Funciona
                    </Link>

                    {/* Products Dropdown */}
                    <div
                        ref={dropdownRef}
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button
                            className="flex items-center gap-1 text-text-main/80 hover:text-primary transition-colors"
                            onClick={() => setProductsOpen(!productsOpen)}
                        >
                            Produtos
                            <ChevronDown className={cn(
                                "w-3.5 h-3.5 transition-transform duration-200",
                                productsOpen && "rotate-180"
                            )} />
                        </button>

                        {/* Dropdown Menu */}
                        <div
                            className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl border border-white/30 bg-white/95 backdrop-blur-xl shadow-xl shadow-black/10 overflow-hidden transition-all duration-200 origin-top",
                                productsOpen
                                    ? "opacity-100 scale-100 pointer-events-auto"
                                    : "opacity-0 scale-95 pointer-events-none"
                            )}
                        >
                            <div className="p-2">
                                {PRODUCTS.map((product) => {
                                    const Icon = product.icon
                                    return (
                                        <Link
                                            key={product.href}
                                            href={product.href}
                                            onClick={() => setProductsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                <Icon className="w-4.5 h-4.5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.description}
                                                </p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                            <div className="border-t border-primary/10 p-2">
                                <Link
                                    href="/produtos"
                                    onClick={() => setProductsOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                                >
                                    Ver todos os produtos
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/produtos">
                        <Button
                            variant={isScrolled ? "primary" : "outline"}
                            size="sm"
                            className={cn(
                                "font-serif rounded-full px-6 transition-all duration-300",
                                !isScrolled && "bg-white/50 hover:bg-white border-primary/20 text-primary hover:text-primary-dark backdrop-blur-sm"
                            )}
                        >
                            Criar Presente
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
