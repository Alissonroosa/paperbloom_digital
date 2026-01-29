"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { NotebookMockup } from "@/components/ui/NotebookMockup";
import { DesktopPreviewContent } from "@/components/ui/DesktopPreviewContent";

export function ProductPreviewSection() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 space-y-8"
                    >
                        <Badge variant="secondary" className="px-4 py-2 text-primary bg-primary/10 hover:bg-primary/20 border-none text-sm font-medium rounded-full">
                            Experiência Interativa
                        </Badge>

                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-main leading-tight">
                            Muito mais que uma foto. <br />
                            <span className="text-primary italic">Uma página de emoções.</span>
                        </h2>

                        <p className="text-lg text-muted-foreground leading-relaxed font-light">
                            Esqueça as mensagens estáticas. Com a Paper Bloom, você cria uma
                            <strong> página web exclusiva e interativa</strong> para quem você ama.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Design responsivo que se adapta a qualquer tela (Celular, Tablet, PC)",
                                "Animações delicadas que dão vida à sua mensagem",
                                "Trilha sonora sincronizada para criar o clima perfeito",
                                "Interatividade real: botões, galerias e surpresas"
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-3 text-text-main/80">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Image Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-1 relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden p-4 md:p-8">
                            <NotebookMockup className="shadow-2xl shadow-primary/20">
                                <DesktopPreviewContent />
                            </NotebookMockup>

                            {/* Decorative Elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -z-10" />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
