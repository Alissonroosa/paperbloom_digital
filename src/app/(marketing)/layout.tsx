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

    return (
        <div className="flex flex-col min-h-screen">
            {!hideHeader && <Header />}
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
