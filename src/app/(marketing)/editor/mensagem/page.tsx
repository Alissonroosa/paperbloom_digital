"use client"

import { useState, useEffect } from "react"
import { WizardProvider, useWizard } from "@/contexts/WizardContext"
import { WizardEditor } from "@/components/wizard"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { useWizardAutoSave } from "@/hooks/useWizardAutoSave"

/**
 * Editor Content Component
 * Handles the wizard state and payment logic
 */
function EditorContent() {
    const {
        state,
        data,
        uploads,
        restoreState,
    } = useWizard();

    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [hasRestoredDraft, setHasRestoredDraft] = useState(false)

    // Auto-save hook for restoration
    const { restore, clear } = useWizardAutoSave({
        key: 'paperbloom-wizard-draft',
        state,
        debounceMs: 2000,
        enabled: false, // Disabled here since WizardEditor handles auto-save
    });

    // Restore saved draft on mount
    useEffect(() => {
        if (hasRestoredDraft) return;
        
        const savedState = restore();
        if (savedState) {
            // Restore the wizard state
            restoreState(savedState);
        }
        
        setHasRestoredDraft(true);
    }, [restore, restoreState, hasRestoredDraft])

    const handlePaymentClick = async () => {
        setIsCreatingCheckout(true)
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

            // Create message with wizard data
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
                urlSlug: data.urlSlug || null,
                backgroundColor: data.backgroundColor || null,
                theme: data.theme || null,
                customEmoji: data.customEmoji || null,
                musicStartTime: data.musicStartTime || null,
                showTimeCounter: data.showTimeCounter || false,
                timeCounterLabel: data.timeCounterLabel || null,
                // Contact info for email delivery
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
            }

            console.log('Sending message data:', messageData);

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
                
                throw new Error(errorData.error?.message || 'Failed to create message')
            }

            const { id: messageId } = await createResponse.json()

            // Create checkout session with contact info for email delivery
            const checkoutResponse = await fetch('/api/checkout/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    messageId,
                    contactName: data.contactName,
                    contactEmail: data.contactEmail,
                    contactPhone: data.contactPhone,
                }),
            })

            if (!checkoutResponse.ok) {
                const errorData = await checkoutResponse.json()
                throw new Error(errorData.error?.message || 'Failed to create checkout session')
            }

            const { url } = await checkoutResponse.json()

            // Clear saved draft before redirecting to payment
            clear();

            // Redirect to Stripe checkout
            window.location.href = url
        } catch (error) {
            console.error('Checkout error:', error)
            setErrors({
                general: error instanceof Error ? error.message : 'Failed to process checkout'
            })
            // Scroll to top to show error
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsCreatingCheckout(false)
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
                        Criação de Mensagem
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
                onPaymentClick={handlePaymentClick}
                isCreatingCheckout={isCreatingCheckout}
            />
        </div>
    )
}

/**
 * Main Editor Page
 * Wraps the editor content with WizardProvider
 */
export default function EditorPage() {
    return (
        <WizardProvider>
            <EditorContent />
        </WizardProvider>
    )
}
