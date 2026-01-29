"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Flower2 } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

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
                        "p-1.5 rounded-full transition-colors duration-300",
                        isScrolled ? "bg-primary/10" : "bg-white/50 backdrop-blur-sm"
                    )}>
                        <Flower2 className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-45" />
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
                    <Link href="/#products" className="text-text-main/80 hover:text-primary transition-colors">
                        Produtos
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/editor">
                        <Button
                            variant={isScrolled ? "primary" : "outline"}
                            size="sm"
                            className={cn(
                                "font-serif rounded-full px-6 transition-all duration-300",
                                !isScrolled && "bg-white/50 hover:bg-white border-primary/20 text-primary hover:text-primary-dark backdrop-blur-sm"
                            )}
                        >
                            Criar Mensagem
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
