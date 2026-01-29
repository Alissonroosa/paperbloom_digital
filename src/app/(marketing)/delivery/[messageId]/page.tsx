'use client';

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowRight, Calendar, CheckCircle, Copy, Download, Gift, Heart, Loader2, Mail, Music, QrCode, Share2, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface MessageData {
  id: string;
  recipientName: string;
  senderName: string;
  slug: string | null;
  qrCodeUrl: string | null;
  status: string;
  title: string | null;
  messageText: string;
  imageUrl: string | null;
  youtubeUrl: string | null;
  specialDate: string | null;
  closingMessage: string | null;
  signature: string | null;
  galleryImages: string[];
}

/**
 * Delivery Page Component
 * Displays QR code and message URL after successful payment
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */
export default function DeliveryPage() {
  const params = useParams();
  const messageId = params.messageId as string;
  
  const [messageData, setMessageData] = useState<MessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!messageId) {
      setError('ID da mensagem não encontrado');
      setLoading(false);
      return;
    }

    // Fetch message data using message ID
    // Requirement 11.1: Display generated QR code prominently
    fetch(`/api/messages/id/${messageId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Falha ao carregar dados da mensagem');
        }
        return res.json();
      })
      .then(data => {
        setMessageData(data);
        setLoading(false);
        // Check if email was sent (this would be set by the webhook)
        // For now, we assume email is sent if status is 'paid'
        setEmailSent(data.status === 'paid');
      })
      .catch(err => {
        console.error('Error fetching message:', err);
        setError('Não foi possível carregar os dados da mensagem');
        setLoading(false);
      });
  }, [messageId]);

  // Requirement 11.3: Show message URL with copy button
  // The slug already contains the full path: /mensagem/{name}/{id}
  const messageUrl = messageData?.slug 
    ? `${window.location.origin}${messageData.slug}`
    : null;

  // Format special date if available
  const formattedDate = messageData?.specialDate 
    ? new Date(messageData.specialDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : null;

  const handleCopyLink = async () => {
    if (messageUrl) {
      try {
        await navigator.clipboard.writeText(messageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Requirement 11.4: Add download QR code button (PNG format)
  const handleDownloadQRCode = () => {
    if (messageData?.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = messageData.qrCodeUrl;
      link.download = `qrcode-${messageData.recipientName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando sua mensagem...</p>
        </div>
      </div>
    );
  }

  if (error || !messageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error || 'Mensagem não encontrada'}</p>
          <Link href="/">
            <Button>Voltar para o Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 pt-24">
      <div className="container px-4 md:px-8 max-w-3xl mx-auto space-y-8">

        {/* Success Message - Requirement 11.1 */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-text-main">
            {messageData.title || 'Sua Mensagem Está Pronta!'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Sua mensagem para <strong>{messageData.recipientName}</strong> foi criada com sucesso!
          </p>
        </div>

        {/* Email Confirmation Message - Requirement 11.6 */}
        {emailSent && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Email enviado com sucesso!
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Enviamos o QR Code e o link da mensagem para o seu email. 
                    Verifique sua caixa de entrada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message Preview Section */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Preview da Sua Mensagem
            </CardTitle>
            <CardDescription>
              Veja como sua mensagem ficou antes de compartilhar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Image */}
            {messageData.imageUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={messageData.imageUrl}
                  alt="Imagem principal da mensagem"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Title */}
            {messageData.title && (
              <div className="text-center">
                <h2 className="text-3xl font-serif font-bold text-text-main">
                  {messageData.title}
                </h2>
              </div>
            )}

            {/* Special Date */}
            {formattedDate && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formattedDate}</span>
              </div>
            )}

            {/* Recipient and Sender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-border">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Para</p>
                  <p className="font-medium">{messageData.recipientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">De</p>
                  <p className="font-medium">{messageData.senderName}</p>
                </div>
              </div>
            </div>

            {/* Main Message */}
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-lg leading-relaxed text-text-main whitespace-pre-wrap">
                {messageData.messageText}
              </p>
            </div>

            {/* Gallery Images */}
            {messageData.galleryImages && messageData.galleryImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Galeria de Fotos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {messageData.galleryImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      <Image
                        src={imageUrl}
                        alt={`Foto da galeria ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Music */}
            {messageData.youtubeUrl && (
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                <Music className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Música de Fundo</p>
                  <p className="text-xs text-muted-foreground">
                    Incluída na mensagem
                  </p>
                </div>
                <a
                  href={messageData.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Ver no YouTube
                </a>
              </div>
            )}

            {/* Closing Message */}
            {messageData.closingMessage && (
              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground italic">
                  {messageData.closingMessage}
                </p>
              </div>
            )}

            {/* Signature */}
            {messageData.signature && (
              <div className="text-center">
                <p className="text-sm font-medium text-text-main">
                  {messageData.signature}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code and Link Display - Requirements 11.2, 11.3 */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Sua Mensagem Digital</CardTitle>
            <CardDescription>Compartilhe com {messageData.recipientName}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* QR Code Image - Requirement 11.2: Display generated QR code prominently */}
            {messageData.qrCodeUrl ? (
              <div className="w-64 h-64 bg-white border-4 border-primary/20 rounded-xl flex items-center justify-center shadow-inner p-4">
                <Image 
                  src={messageData.qrCodeUrl} 
                  alt="QR Code da mensagem"
                  width={240}
                  height={240}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-white border-4 border-primary/20 rounded-xl flex flex-col items-center justify-center shadow-inner p-4">
                <QrCode className="w-32 h-32 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  QR Code em processamento...
                </p>
              </div>
            )}

            {/* Shareable Link - Requirement 11.3: Show message URL with copy button */}
            {messageUrl && (
              <div className="w-full max-w-md space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Link compartilhável:
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={messageUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyLink}
                    title="Copiar link"
                    className="px-3"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons - Requirement 11.4: Add download QR code button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleDownloadQRCode}
                disabled={!messageData.qrCodeUrl}
              >
                <Download className="w-4 h-4" />
                Baixar QR Code
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleCopyLink}
                disabled={!messageUrl}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copiado!' : 'Copiar Link'}
              </Button>
              <Button 
                variant="default" 
                className="gap-2"
                onClick={() => messageUrl && window.open(messageUrl, '_blank')}
                disabled={!messageUrl}
              >
                <ArrowRight className="w-4 h-4" />
                Abrir Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sharing Instructions - Requirement 11.5: Display sharing instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Como Compartilhar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">1.</span>
                <span>
                  <strong>WhatsApp ou Email:</strong> Envie o QR Code ou o link diretamente 
                  para {messageData.recipientName}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">2.</span>
                <span>
                  <strong>Imprimir:</strong> Baixe o QR Code e imprima em um cartão físico 
                  para entregar pessoalmente
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">3.</span>
                <span>
                  <strong>Redes Sociais:</strong> Compartilhe o link nas suas redes sociais 
                  para que todos possam ver
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">4.</span>
                <span>
                  <strong>Escanear:</strong> Qualquer pessoa pode escanear o QR Code com a 
                  câmera do celular para acessar a mensagem
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Cross-sell Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wide">
                Oferta Especial
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-main">
                Que tal transformar isso em um presente físico?
              </h2>
              <p className="text-muted-foreground">
                Podemos imprimir seu QR Code em uma caneca personalizada ou em um quadro decorativo.
                Uma lembrança que dura para sempre.
              </p>
              <Link 
                href="https://chat.whatsapp.com/Jp7rYlcP2HG6TmO5nCoEuF" 
                target="_blank"
              >
                <Button size="lg" className="w-full md:w-auto shadow-lg gap-2">
                  Falar com Atendente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="w-full md:w-48 h-48 bg-white rounded-lg shadow-md flex items-center justify-center shrink-0 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Gift className="w-16 h-16 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link href="/">
            <Button variant="ghost">Voltar para o Início</Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            Precisa de ajuda? Entre em contato conosco
          </p>
        </div>

      </div>
    </div>
  );
}
