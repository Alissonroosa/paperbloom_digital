import Link from "next/link"
import { Flower2, Instagram, Mail, Phone } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t bg-background/50">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 md:flex-row max-w-screen-xl px-6">
                <div className="flex items-center gap-3">
                    <Flower2 className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Paper Bloom. Todos os direitos reservados.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/politica-de-privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Privacidade
                    </Link>
                    <Link href="/recuperar-acesso" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Perdi meu acesso
                    </Link>
                    <Link href="https://wa.me/5551992698003" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        <Phone className="h-5 w-5" />
                        <span className="text-sm hidden sm:inline">Suporte</span>
                        <span className="sr-only">Suporte WhatsApp</span>
                    </Link>
                    <Link href="https://www.instagram.com/paperbloomrs/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                    </Link>
                    <Link href="mailto:contato@paperbloom.com.br" className="text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-5 w-5" />
                        <span className="sr-only">Email</span>
                    </Link>
                </div>
            </div>
        </footer>
    )
}
