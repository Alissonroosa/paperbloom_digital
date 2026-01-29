'use client';

import React, { ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Music, Image as ImageIcon, Loader2, Sparkles, Calendar } from "lucide-react"
import { TextSuggestionPanel } from "./TextSuggestionPanel"
import { SuggestionField } from "@/data/suggestions"

interface EditorFormProps {
    data: {
        title?: string
        specialDate?: Date | null
        image: File | null
        galleryImages?: (File | null)[]
        message: string
        signature?: string
        closing?: string
        from: string
        to: string
        youtubeLink: string
    }
    onChange: (field: string, value: string | File | null | Date | (File | null)[]) => void
    errors?: Record<string, string>
    isUploadingImage?: boolean
    isUploadingGallery?: boolean[]
}

export function EditorForm({ 
    data, 
    onChange, 
    errors = {}, 
    isUploadingImage = false,
    isUploadingGallery = [false, false, false]
}: EditorFormProps) {
    const [showSuggestions, setShowSuggestions] = useState<SuggestionField | null>(null);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onChange("image", file)
        }
    }

    const handleGalleryUpload = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const newGallery = [...(data.galleryImages || [null, null, null, null, null, null, null])];
            newGallery[index] = file;
            onChange("galleryImages", newGallery);
        }
    }

    const handleSuggestionSelect = (field: SuggestionField, text: string) => {
        onChange(field, text);
        setShowSuggestions(null);
    }

    const formatDateForInput = (date: Date | null | undefined): string => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value) {
            onChange("specialDate", new Date(value));
        } else {
            onChange("specialDate", null);
        }
    }

    return (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border">
            <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-text-main">Personalize</h2>
                <p className="text-sm text-muted-foreground">Preencha os detalhes da sua mensagem.</p>
            </div>

            <form className="space-y-4" aria-label="Formulário de personalização de mensagem">
                {/* Title Input with Suggestions */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="title">Título</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSuggestions('title')}
                            className="h-9 min-h-[44px] min-w-[44px] text-xs gap-1"
                            aria-label="Ver sugestões de título"
                        >
                            <Sparkles className="w-3 h-3" aria-hidden="true" />
                            <span className="hidden sm:inline">Sugestões</span>
                        </Button>
                    </div>
                    <Input
                        id="title"
                        placeholder="Ex: Para o Amor da Minha Vida"
                        value={data.title || ''}
                        onChange={(e) => onChange("title", e.target.value)}
                        maxLength={100}
                        className={errors.title ? 'border-red-500' : ''}
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? "title-error title-count" : "title-count"}
                    />
                    <div className="flex justify-between items-center">
                        {errors.title && (
                            <p id="title-error" className="text-xs text-red-600" role="alert">{errors.title}</p>
                        )}
                        <p id="title-count" className={`text-xs text-muted-foreground ${errors.title ? 'ml-auto' : 'w-full text-right'}`} aria-live="polite">
                            {(data.title || '').length}/100 caracteres
                        </p>
                    </div>
                </div>

                {/* Special Date Picker */}
                <div className="space-y-2">
                    <Label htmlFor="specialDate">Data Especial</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                        <Input
                            id="specialDate"
                            type="date"
                            value={formatDateForInput(data.specialDate)}
                            onChange={handleDateChange}
                            className={`pl-9 ${errors.specialDate ? 'border-red-500' : ''}`}
                            aria-invalid={!!errors.specialDate}
                            aria-describedby={errors.specialDate ? "specialDate-error" : undefined}
                            aria-label="Selecione uma data especial"
                        />
                    </div>
                    {errors.specialDate && (
                        <p id="specialDate-error" className="text-xs text-red-600" role="alert">{errors.specialDate}</p>
                    )}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <Label htmlFor="image-upload">Foto Principal</Label>
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className={`w-full min-h-[96px] h-24 border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors ${
                                errors.image ? 'border-red-500' : ''
                            }`}
                            onClick={() => document.getElementById("image-upload")?.click()}
                            disabled={isUploadingImage}
                            aria-label={data.image ? "Trocar foto principal" : "Carregar foto principal"}
                            aria-describedby={errors.image ? "image-error" : undefined}
                        >
                            {isUploadingImage ? (
                                <>
                                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" aria-hidden="true" />
                                    <span className="text-sm text-muted-foreground">
                                        Enviando...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
                                    <span className="text-sm text-muted-foreground">
                                        {data.image ? "Trocar Foto" : "Carregar Foto"}
                                    </span>
                                </>
                            )}
                        </Button>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                            aria-label="Selecionar arquivo de imagem principal"
                        />
                    </div>
                    {errors.image && (
                        <p id="image-error" className="text-xs text-red-600" role="alert">{errors.image}</p>
                    )}
                </div>

                {/* Gallery Uploader (3 additional photos) */}
                <div className="space-y-2">
                    <Label>Galeria de Fotos (até 3 fotos adicionais)</Label>
                    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Galeria de fotos adicionais">
                        {[0, 1, 2].map((index) => (
                            <div key={index}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={`w-full min-h-[80px] h-20 border-dashed border-2 flex flex-col gap-1 hover:bg-primary/5 hover:border-primary/50 transition-colors ${
                                        errors[`galleryImage${index}`] ? 'border-red-500' : ''
                                    }`}
                                    onClick={() => document.getElementById(`gallery-upload-${index}`)?.click()}
                                    disabled={isUploadingGallery[index]}
                                    aria-label={data.galleryImages?.[index] ? `Trocar foto ${index + 1} da galeria` : `Carregar foto ${index + 1} da galeria`}
                                    aria-describedby={errors[`galleryImage${index}`] ? `gallery-error-${index}` : undefined}
                                >
                                    {isUploadingGallery[index] ? (
                                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" aria-hidden="true" />
                                    ) : (
                                        <>
                                            <ImageIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                            <span className="text-xs text-muted-foreground">
                                                {data.galleryImages?.[index] ? "Trocar" : `Foto ${index + 1}`}
                                            </span>
                                        </>
                                    )}
                                </Button>
                                <input
                                    id={`gallery-upload-${index}`}
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleGalleryUpload(index)}
                                    disabled={isUploadingGallery[index]}
                                    aria-label={`Selecionar arquivo para foto ${index + 1} da galeria`}
                                />
                                {errors[`galleryImage${index}`] && (
                                    <p id={`gallery-error-${index}`} className="text-xs text-red-600 mt-1" role="alert">{errors[`galleryImage${index}`]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    {errors.galleryImages && (
                        <p className="text-xs text-red-600" role="alert">{errors.galleryImages}</p>
                    )}
                </div>

                {/* From / To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="from">De (Remetente) *</Label>
                        <Input
                            id="from"
                            placeholder="Seu nome"
                            value={data.from}
                            onChange={(e) => onChange("from", e.target.value)}
                            className={errors.from ? 'border-red-500' : ''}
                            required
                            aria-required="true"
                            aria-invalid={!!errors.from}
                            aria-describedby={errors.from ? "from-error" : undefined}
                        />
                        {errors.from && (
                            <p id="from-error" className="text-xs text-red-600" role="alert">{errors.from}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="to">Para (Destinatário) *</Label>
                        <Input
                            id="to"
                            placeholder="Nome dele(a)"
                            value={data.to}
                            onChange={(e) => onChange("to", e.target.value)}
                            className={errors.to ? 'border-red-500' : ''}
                            required
                            aria-required="true"
                            aria-invalid={!!errors.to}
                            aria-describedby={errors.to ? "to-error" : undefined}
                        />
                        {errors.to && (
                            <p id="to-error" className="text-xs text-red-600" role="alert">{errors.to}</p>
                        )}
                    </div>
                </div>

                {/* Message with Suggestions */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="message">Sua Mensagem *</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSuggestions('message')}
                            className="h-9 min-h-[44px] min-w-[44px] text-xs gap-1"
                            aria-label="Ver sugestões de mensagem"
                        >
                            <Sparkles className="w-3 h-3" aria-hidden="true" />
                            <span className="hidden sm:inline">Sugestões</span>
                        </Button>
                    </div>
                    <Textarea
                        id="message"
                        placeholder="Escreva algo especial..."
                        className={`min-h-[120px] resize-none ${errors.message ? 'border-red-500' : ''}`}
                        value={data.message}
                        onChange={(e) => onChange("message", e.target.value)}
                        maxLength={500}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error message-count" : "message-count"}
                    />
                    <div className="flex justify-between items-center">
                        {errors.message && (
                            <p id="message-error" className="text-xs text-red-600" role="alert">{errors.message}</p>
                        )}
                        <p id="message-count" className={`text-xs text-right text-muted-foreground ${errors.message ? 'ml-auto' : 'w-full'}`} aria-live="polite">
                            {data.message.length}/500 caracteres
                        </p>
                    </div>
                </div>

                {/* Signature Input */}
                <div className="space-y-2">
                    <Label htmlFor="signature">Assinatura</Label>
                    <Input
                        id="signature"
                        placeholder="Ex: Com todo meu amor"
                        value={data.signature || ''}
                        onChange={(e) => onChange("signature", e.target.value)}
                        maxLength={50}
                        className={errors.signature ? 'border-red-500' : ''}
                        aria-invalid={!!errors.signature}
                        aria-describedby={errors.signature ? "signature-error signature-count" : "signature-count"}
                    />
                    <div className="flex justify-between items-center">
                        {errors.signature && (
                            <p id="signature-error" className="text-xs text-red-600" role="alert">{errors.signature}</p>
                        )}
                        <p id="signature-count" className={`text-xs text-muted-foreground ${errors.signature ? 'ml-auto' : 'w-full text-right'}`} aria-live="polite">
                            {(data.signature || '').length}/50 caracteres
                        </p>
                    </div>
                </div>

                {/* Closing Message with Suggestions */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="closing">Mensagem de Fechamento</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSuggestions('closing')}
                            className="h-9 min-h-[44px] min-w-[44px] text-xs gap-1"
                            aria-label="Ver sugestões de mensagem de fechamento"
                        >
                            <Sparkles className="w-3 h-3" aria-hidden="true" />
                            <span className="hidden sm:inline">Sugestões</span>
                        </Button>
                    </div>
                    <Textarea
                        id="closing"
                        placeholder="Ex: Te amo hoje, amanhã e sempre"
                        className={`min-h-[80px] resize-none ${errors.closing ? 'border-red-500' : ''}`}
                        value={data.closing || ''}
                        onChange={(e) => onChange("closing", e.target.value)}
                        maxLength={200}
                        aria-invalid={!!errors.closing}
                        aria-describedby={errors.closing ? "closing-error closing-count" : "closing-count"}
                    />
                    <div className="flex justify-between items-center">
                        {errors.closing && (
                            <p id="closing-error" className="text-xs text-red-600" role="alert">{errors.closing}</p>
                        )}
                        <p id="closing-count" className={`text-xs text-muted-foreground ${errors.closing ? 'ml-auto' : 'w-full text-right'}`} aria-live="polite">
                            {(data.closing || '').length}/200 caracteres
                        </p>
                    </div>
                </div>

                {/* YouTube Link */}
                <div className="space-y-2">
                    <Label htmlFor="youtube">Link do YouTube (Música)</Label>
                    <div className="relative">
                        <Music className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                        <Input
                            id="youtube"
                            type="url"
                            placeholder="https://youtube.com/watch?v=..."
                            className={`pl-9 ${errors.youtubeLink ? 'border-red-500' : ''}`}
                            value={data.youtubeLink}
                            onChange={(e) => onChange("youtubeLink", e.target.value)}
                            aria-invalid={!!errors.youtubeLink}
                            aria-describedby={errors.youtubeLink ? "youtube-error" : undefined}
                        />
                    </div>
                    {errors.youtubeLink && (
                        <p id="youtube-error" className="text-xs text-red-600" role="alert">{errors.youtubeLink}</p>
                    )}
                </div>
            </form>

            {/* Text Suggestion Panel Modal */}
            {showSuggestions && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="suggestion-panel-title"
                >
                    <TextSuggestionPanel
                        field={showSuggestions}
                        currentValue={data[showSuggestions] || ''}
                        onSelectSuggestion={(text) => handleSuggestionSelect(showSuggestions, text)}
                        onClose={() => setShowSuggestions(null)}
                    />
                </div>
            )}
        </div>
    )
}
