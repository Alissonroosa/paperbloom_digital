'use client';

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { usePathname } from "next/navigation";

export default function MarketingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const hideHeader = pathname === '/editor/mensagem' || pathname === '/editor/12-cartas';
    const hideChromes = pathname.startsWith('/painel');

    return (
        <div className="flex flex-col min-h-screen">
            {!hideHeader && !hideChromes && <Header />}
            <main className="flex-1">{children}</main>
            {!hideChromes && <Footer />}
        </div>
    );
}
