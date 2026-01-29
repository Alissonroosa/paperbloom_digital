"use client"

import { useState, useEffect } from "react"
import { WizardProvider, useWizard } from "@/contexts/WizardContext"
import { WizardEditor } from "@/components/wizard"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { useRouter } from "next/navigation"

/**
 * Demo Editor Content Component
 * Handles the wizard state and demo message creation
 */
function DemoEditorContent() {
    const {
        state,
        data,
        uploads,
        restoreState,
        updateField,
    } = useWizard();

    const router = useRouter();
    const [isCreatingDemo, setIsCreatingDemo] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [hasInitialized, setHasInitialized] = useState(false)

    // Initialize with demo default values
    useEffect(() => {
        if (hasInitialized) return;
        
        // Set default demo values
        updateField('recipientName', "Maria");
        updateField('senderName', "João");
        updateField('mainMessage', "Não importa quanto tempo passe, cada momento ao seu lado continua sendo o meu presente favorito. Obrigado por ser minha companheira, minha amiga e o amor da minha vida.");
        updateField('pageTitle', "Feliz Aniversário!");
        updateField('specialDate', new Date("2024-11-23"));
        updateField('signature', "Seu Eterno Apaixonado");
        updateField('youtubeUrl', "https://www.youtube.com/watch?v=nSDgHBxUbVQ");
        updateField('closingMessage', "Você é importante para mim.");
        // Contact info (required for demo)
        updateField('contactName', "Demo User");
        updateField('contactEmail', "demo@paperbloom.com");
        updateField('contactPhone', "+55 11 99999-9999");
        
        setHasInitialized(true);
    }, [hasInitialized, updateField])

    const handleCreateDemo = async () => {
        setIsCreatingDemo(true)
        setErrors({})

        try {
            // Upload main image if not already uploaded
            let mainImageUrl = uploads.mainImage.url;
            if (data.mainImage && !mainImageUrl) {
                const formData = new FormData()
                formData.append('image', data.mainImage)

                const response = await fetch('/api/messages/upload-image', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error?.message || 'Failed to upload main image')
                }

                const result = await response.json()
                mainImageUrl = result.url
            }

            // Upload gallery images if not already uploaded
            const galleryUrls: string[] = [];
            for (let i = 0; i < data.galleryImages.length; i++) {
                const file = data.galleryImages[i];
                const existingUrl = uploads.galleryImages[i]?.url;

                if (file && !existingUrl) {
                    const formData = new FormData()
                    formData.append('image', file)

                    const response = await fetch('/api/messages/upload-image', {
                        method: 'POST',
                        body: formData,
                    })

                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error?.message || `Failed to upload gallery image ${i + 1}`)
                    }

                    const result = await response.json()
                    galleryUrls.push(result.url)
                } else if (existingUrl) {
                    galleryUrls.push(existingUrl)
                }
            }

            // Create demo message with wizard data
            const messageData = {
                recipientName: data.recipientName,
                senderName: data.senderName,
                messageText: data.mainMessage,
                imageUrl: mainImageUrl,
                youtubeUrl: data.youtubeUrl || null,
                // Enhanced fields from wizard
                title: data.pageTitle || null,
                specialDate: data.specialDate ? data.specialDate.toISOString() : null,
                closingMessage: data.closingMessage || null,
                signature: data.signature || null,
                galleryImages: galleryUrls,
                // Additional wizard fields
                urlSlug: 'demo-' + Date.now(), // Unique slug for demo
                backgroundColor: data.backgroundColor || null,
                theme: data.theme || null,
                musicStartTime: data.musicStartTime || null,
                // Contact info
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
            }

            console.log('Creating demo message:', messageData);

            const createResponse = await fetch('/api/messages/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            })

            if (!createResponse.ok) {
                const errorData = await createResponse.json()
                console.error('API Error:', errorData);
                
                // Show detailed validation errors if available
                if (errorData.error?.details) {
                    const detailsStr = Object.entries(errorData.error.details)
                        .map(([field, msg]) => `${field}: ${msg}`)
                        .join(', ');
                    throw new Error(`${errorData.error.message} - ${detailsStr}`)
                }
                
                throw new Error(errorData.error?.message || 'Failed to create demo message')
            }

            const { id: messageId } = await createResponse.json()

            // Save demo data to localStorage for the demo page
            const demoData = {
                introText1: "Existe algo que só você deveria ver hoje...",
                introText2: "Uma pessoa pensou em você com carinho.",
                pageTitle: data.pageTitle || "Feliz Aniversário!",
                recipientName: data.recipientName || "Para o meu amor,",
                specialDate: data.specialDate ? data.specialDate.toLocaleDateString('pt-BR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                }) : "23 de Novembro, 2024",
                mainMessage: data.mainMessage,
                signature: data.signature || "Seu Eterno Apaixonado",
                mainImageUrl: mainImageUrl || "",
                galleryImages: galleryUrls,
                youtubeVideoId: data.youtubeUrl ? new URL(data.youtubeUrl).searchParams.get('v') || "" : "nSDgHBxUbVQ",
                youtubeSongName: "Ed Sheeran - Perfect",
                messageId: messageId, // Store the message ID
                showTimeCounter: data.showTimeCounter || false,
                timeCounterLabel: data.timeCounterLabel || "",
                specialDateISO: data.specialDate ? data.specialDate.toISOString() : null,
                // Theme customization
                backgroundColor: data.backgroundColor || '#FDF6F0',
                theme: data.theme || 'gradient',
                customEmoji: data.customEmoji || null,
            };

            localStorage.setItem('paperbloom-demo-data', JSON.stringify(demoData));

            // Redirect to demo page
            router.push('/demo/message');
        } catch (error) {
            console.error('Demo creation error:', error)
            setErrors({
                general: error instanceof Error ? error.message : 'Failed to create demo message'
            })
            // Scroll to top to show error
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsCreatingDemo(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Simple Header for Editor */}
            <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50" role="banner">
                <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-screen-2xl mx-auto">
                    <Link 
                        href="/" 
                        className="font-serif text-xl font-bold tracking-tight text-text-main min-w-[44px] min-h-[44px] flex items-center"
                        aria-label="Voltar para página inicial do Paper Bloom"
                    >
                        Paper Bloom
                    </Link>
                    <div className="text-sm text-muted-foreground hidden md:block" aria-live="polite">
                        Editor de Demonstração
                    </div>
                    <Link href="/">
                        <Button 
                            size="sm" 
                            variant="ghost"
                            aria-label="Cancelar edição e voltar"
                        >
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

            {/* Wizard Editor */}
            <WizardEditor
                onPaymentClick={handleCreateDemo}
                isCreatingCheckout={isCreatingDemo}
            />

            {/* Instructions */}
            <div className="container px-4 md:px-8 max-w-4xl mx-auto pb-8">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Modo Demonstração</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Preencha todos os campos do formulário como um cliente faria</li>
                        <li>• Faça upload de imagens reais (serão salvas no R2)</li>
                        <li>• Adicione uma música do YouTube</li>
                        <li>• Ao finalizar, a mensagem será salva no banco de dados</li>
                        <li>• Você será redirecionado para a página demo com os dados reais</li>
                        <li>• Este é o fluxo completo end-to-end que os clientes usarão</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

/**
 * Main Demo Editor Page
 * Wraps the editor content with WizardProvider
 */
export default function DemoEditorPage() {
    return (
        <WizardProvider>
            <DemoEditorContent />
        </WizardProvider>
    )
}
