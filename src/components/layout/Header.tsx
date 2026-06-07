"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Heart, Calendar, Baby, ChevronDown, ShoppingBag } from "lucide-react"
import { catalogService } from "@/services/CatalogService"

// Rotas que têm uma seção #how-it-works embutida na própria página.
// Pra essas, o link do header rola na mesma página em vez de jogar pra home —
// evita desorientar o usuário (especialmente em LPs de produto).
const ROUTES_WITH_HOW_IT_WORKS = new Set<string>([
  "/",
  "/12-cartas",
])

const EXPERIENCIAS = [
    { name: "Mensagem Digital", href: "/mensagem-digital", icon: Heart, description: "Foto, música e mensagem" },
    { name: "12 Cartas", href: "/12-cartas", icon: Calendar, description: "12 momentos inesquecíveis" },
    { name: "Revelação Virtual", href: "/revelacao-virtual", icon: Baby, description: "Menino ou menina?" },
]

// Enquanto há coleção sazonal ativa, o botão "Loja" leva direto para ela.
// Quando não houver, cai no catálogo geral /loja.
function getLojaHref(): string {
    const active = catalogService.getActiveCollection();
    return active ? `/loja/colecao/${active.slug}` : '/loja';
}

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [experienciasOpen, setExperienciasOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lojaHref = getLojaHref()
    const pathname = usePathname()
    // Se a rota atual tem #how-it-works, link rola na mesma página.
    // Caso contrário, joga pra home (que tem a seção).
    const howItWorksHref = ROUTES_WITH_HOW_IT_WORKS.has(pathname || "")
        ? "#how-it-works"
        : "/#how-it-works"

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setExperienciasOpen(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setExperienciasOpen(false), 200)
    }

    return (
        <header
            className={cn(
                // Em mobile, header mais estreito (90%) pra não colar nas bordas e parecer menos pesado
                "fixed top-3 md:top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-[85%] max-w-5xl rounded-full transition-all duration-500 ease-in-out",
                isScrolled
                    ? "border border-white/20 bg-white/70 backdrop-blur-md shadow-lg shadow-black/5 py-1.5 md:py-2"
                    : "bg-transparent border-transparent py-2.5 md:py-4"
            )}
        >
            <div className="container flex h-10 md:h-12 items-center justify-between px-3 md:px-6">
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
                            // Logo menor em mobile (32px) pra dar mais respiro
                            className="w-8 h-8 md:w-[38px] md:h-[38px] transition-transform duration-300 group-hover:rotate-45"
                        />
                    </div>
                    {/* Texto "Paper Bloom" escondido em mobile pra dar espaço ao CTA.
                        Ícone redondo já carrega o reconhecimento de marca. */}
                    <span className={cn(
                        "hidden sm:inline font-serif text-lg font-bold tracking-tight transition-colors duration-300",
                        isScrolled ? "text-text-main" : "text-text-main"
                    )}>
                        Paper Bloom
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/" className="text-text-main/80 hover:text-primary transition-colors">
                        Início
                    </Link>
                    <Link href={howItWorksHref} className="text-text-main/80 hover:text-primary transition-colors">
                        Como Funciona
                    </Link>

                    {/* Experiências Dropdown */}
                    <div
                        ref={dropdownRef}
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button
                            className="flex items-center gap-1 text-text-main/80 hover:text-primary transition-colors"
                            onClick={() => setExperienciasOpen(!experienciasOpen)}
                        >
                            Experiências
                            <ChevronDown className={cn(
                                "w-3.5 h-3.5 transition-transform duration-200",
                                experienciasOpen && "rotate-180"
                            )} />
                        </button>

                        {/* Dropdown Menu */}
                        <div
                            className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl border border-white/30 bg-white/95 backdrop-blur-xl shadow-xl shadow-black/10 overflow-hidden transition-all duration-200 origin-top",
                                experienciasOpen
                                    ? "opacity-100 scale-100 pointer-events-auto"
                                    : "opacity-0 scale-95 pointer-events-none"
                            )}
                        >
                            <div className="p-2">
                                {EXPERIENCIAS.map((experiencia) => {
                                    const Icon = experiencia.icon
                                    return (
                                        <Link
                                            key={experiencia.href}
                                            href={experiencia.href}
                                            onClick={() => setExperienciasOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                <Icon className="w-4.5 h-4.5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                                                    {experiencia.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {experiencia.description}
                                                </p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                            <div className="border-t border-primary/10 p-2">
                                <Link
                                    href="/experiencias"
                                    onClick={() => setExperienciasOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                                >
                                    Ver todas as experiências
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Loja — direciona para coleção ativa enquanto houver */}
                    <Link
                        href={lojaHref}
                        className="flex items-center gap-1.5 text-text-main/80 hover:text-primary transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Loja
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/escolher-presente">
                        <Button
                            variant={isScrolled ? "primary" : "outline"}
                            size="sm"
                            className={cn(
                                // Em mobile o botão fica menor (px-3, text-xs) pra não competir com a logo
                                "font-serif rounded-full px-3 md:px-6 text-xs md:text-sm h-9 md:h-10 transition-all duration-300",
                                !isScrolled && "bg-white/50 hover:bg-white border-primary/20 text-primary hover:text-primary-dark backdrop-blur-sm"
                            )}
                        >
                            {/* Texto encurtado em mobile */}
                            <span className="md:hidden">Meu presente</span>
                            <span className="hidden md:inline">Quero meu presente</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
