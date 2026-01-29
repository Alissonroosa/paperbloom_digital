"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiveStepCardCollectionEditor } from "@/components/card-editor/FiveStepCardCollectionEditor";
import { CardCollectionEditorProvider } from "@/contexts/CardCollectionEditorContext";

/**
 * Demo Editor Content Component
 */
function DemoEditorContent({ collectionId }: { collectionId: string }) {
    const router = useRouter();
    const [isCreatingDemo, setIsCreatingDemo] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreateDemo = async () => {
        setIsCreatingDemo(true);
        setErrors({});

        try {
            // Fetch the collection data
            const response = await fetch(`/api/card-collections/${collectionId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch collection data');
            }

            const { collection, cards } = await response.json();

            // Prepare demo data for the demo page
            const demoData = {
                introText1: "12 momentos especiais esperam por você...",
                introText2: "Alguém preparou algo único para celebrar sua história.",
                collectionTitle: collection.title || "Nossa História em 12 Cartas",
                recipientName: collection.recipientName || "Para você, meu amor",
                cards: cards.map((card: any) => ({
                    id: card.id,
                    order: card.order,
                    title: card.title || `Carta ${card.order}`,
                    message: card.message || '',
                    imageUrl: card.imageUrl || '',
                    momentLabel: card.momentLabel || 'Momento Especial'
                })),
                youtubeVideoId: collection.youtubeVideoId || "nSDgHBxUbVQ",
                backgroundColor: collection.backgroundColor || '#FDF6F0',
                theme: collection.theme || 'gradient',
                customEmoji: collection.customEmoji || null,
                showTimeCounter: collection.showTimeCounter || false,
                timeCounterLabel: collection.timeCounterLabel || "",
                specialDateISO: collection.specialDate || null,
                collectionId: collectionId,
            };

            // Save to localStorage
            localStorage.setItem('paperbloom-card-collection-demo-data', JSON.stringify(demoData));

            // Redirect to demo page
            router.push('/demo/card-collection');
        } catch (error) {
            console.error('Demo creation error:', error);
            setErrors({
                general: error instanceof Error ? error.message : 'Falha ao criar demo'
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsCreatingDemo(false);
        }
    };

    return (
        <>
            {/* Error Display */}
            {errors.general && (
                <div className="container px-4 md:px-8 max-w-screen-2xl mx-auto mt-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                </div>
            )}

            <CardCollectionEditorProvider
                collectionId={collectionId}
                autoSaveEnabled={true}
            >
                <FiveStepCardCollectionEditor
                    onFinalize={handleCreateDemo}
                    isProcessing={isCreatingDemo}
                />

                {/* Instructions */}
                <div className="container px-4 md:px-8 max-w-4xl mx-auto pb-8">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">💡 Modo Demonstração - 12 Cartas</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Preencha as 12 cartas com mensagens e fotos</li>
                            <li>• Organize as cartas em momentos (O Início, Crescendo Juntos, etc.)</li>
                            <li>• Adicione uma música do YouTube para tocar durante a experiência</li>
                            <li>• Personalize cores e temas</li>
                            <li>• Ao finalizar, você verá a experiência cinematográfica completa</li>
                            <li>• Este é o produto final que seus clientes receberão</li>
                        </ul>
                    </div>
                </div>
            </CardCollectionEditorProvider>
        </>
    );
}

/**
 * Demo Editor Page for Card Collection
 * Allows users to create a demo 12-card collection and preview it
 */
export default function DemoCardCollectionEditorPage() {
    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Create a demo collection on mount
    useEffect(() => {
        const createDemoCollection = async () => {
            try {
                const response = await fetch('/api/card-collections/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: 'Demo - Nossa História em 12 Cartas',
                        recipientName: 'Para você, meu amor',
                        senderName: 'Seu Eterno Apaixonado',
                        // Contact info (required)
                        contactName: 'Demo User',
                        contactEmail: 'demo@paperbloom.com',
                        contactPhone: '+55 11 99999-9999',
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    throw new Error(errorData.error?.message || 'Failed to create demo collection');
                }

                const { collection } = await response.json();
                setCollectionId(collection.id);
            } catch (error) {
                console.error('Failed to create demo collection:', error);
                setErrors({
                    general: error instanceof Error ? error.message : 'Falha ao criar coleção demo. Por favor, recarregue a página.'
                });
            }
        };

        createDemoCollection();
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-screen-2xl mx-auto">
                    <Link 
                        href="/" 
                        className="font-serif text-xl font-bold tracking-tight text-text-main"
                    >
                        Paper Bloom
                    </Link>
                    <div className="text-sm text-muted-foreground hidden md:block">
                        Editor Demo - 12 Cartas
                    </div>
                    <Link href="/">
                        <Button size="sm" variant="ghost">
                            Cancelar
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Error Display */}
            {errors.general && (
                <div className="container px-4 md:px-8 max-w-screen-2xl mx-auto mt-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {!collectionId && !errors.general && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Criando coleção demo...</p>
                    </div>
                </div>
            )}

            {/* Editor */}
            {collectionId && <DemoEditorContent collectionId={collectionId} />}
        </div>
    );
}
