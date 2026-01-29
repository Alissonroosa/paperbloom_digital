'use client';

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowRight, Calendar, CheckCircle, Copy, Download, Gift, Heart, Mail, Music, QrCode, Share2, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

/**
 * Test page for delivery preview with message data
 * Demonstrates how the delivery page displays user-inputted data after payment
 */
export default function TestDeliveryPreviewPage() {
  const [copied, setCopied] = useState(false);

  // Mock message data - simulating what would come from the API
  const mockMessageData = {
    id: 'test-message-id',
    recipientName: 'Maria Silva',
    senderName: 'João Santos',
    slug: 'mensagem-especial-maria',
    qrCodeUrl: '/qr-codes/test-qr-code.png',
    status: 'paid',
    title: 'Feliz Aniversário, Maria!',
    messageText: 'Querida Maria,\n\nNeste dia especial, quero te desejar muita felicidade, saúde e realizações. Você é uma pessoa incrível e merece tudo de melhor que a vida pode oferecer.\n\nQue este novo ano seja repleto de momentos inesquecíveis e conquistas maravilhosas!\n\nCom todo carinho,\nJoão',
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    specialDate: '2024-03-15T00:00:00.000Z',
    closingMessage: 'Que todos os seus sonhos se realizem!',
    signature: 'Com amor, João',
    galleryImages: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
    ],
  };

  const messageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/mensagem/${mockMessageData.recipientName.toLowerCase().replace(/\s+/g, '-')}/${mockMessageData.slug}`;

  const formattedDate = new Date(mockMessageData.specialDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(messageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadQRCode = () => {
    // In a real scenario, this would download the actual QR code
    alert('Download do QR Code iniciado!');
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container px-4 md:px-8 max-w-3xl mx-auto space-y-8">

        {/* Test Banner */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Página de Teste - Preview de Entrega
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta é uma demonstração de como a página de entrega exibe os dados da mensagem após o pagamento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-text-main">
            {mockMessageData.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            Sua mensagem para <strong>{mockMessageData.recipientName}</strong> foi criada com sucesso!
          </p>
        </div>

        {/* Email Confirmation Message */}
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
            {mockMessageData.imageUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={mockMessageData.imageUrl}
                  alt="Imagem principal da mensagem"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Title */}
            {mockMessageData.title && (
              <div className="text-center">
                <h2 className="text-3xl font-serif font-bold text-text-main">
                  {mockMessageData.title}
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
                  <p className="font-medium">{mockMessageData.recipientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">De</p>
                  <p className="font-medium">{mockMessageData.senderName}</p>
                </div>
              </div>
            </div>

            {/* Main Message */}
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-lg leading-relaxed text-text-main whitespace-pre-wrap">
                {mockMessageData.messageText}
              </p>
            </div>

            {/* Gallery Images */}
            {mockMessageData.galleryImages && mockMessageData.galleryImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Galeria de Fotos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mockMessageData.galleryImages.map((imageUrl, index) => (
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
            {mockMessageData.youtubeUrl && (
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                <Music className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Música de Fundo</p>
                  <p className="text-xs text-muted-foreground">
                    Incluída na mensagem
                  </p>
                </div>
                <a
                  href={mockMessageData.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Ver no YouTube
                </a>
              </div>
            )}

            {/* Closing Message */}
            {mockMessageData.closingMessage && (
              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground italic">
                  {mockMessageData.closingMessage}
                </p>
              </div>
            )}

            {/* Signature */}
            {mockMessageData.signature && (
              <div className="text-center">
                <p className="text-sm font-medium text-text-main">
                  {mockMessageData.signature}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code and Link Display */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Sua Mensagem Digital</CardTitle>
            <CardDescription>Compartilhe com {mockMessageData.recipientName}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* QR Code Placeholder */}
            <div className="w-64 h-64 bg-white border-4 border-primary/20 rounded-xl flex flex-col items-center justify-center shadow-inner p-4">
              <QrCode className="w-32 h-32 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                QR Code da mensagem
              </p>
            </div>

            {/* Shareable Link */}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleDownloadQRCode}
              >
                <Download className="w-4 h-4" />
                Baixar QR Code
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copiado!' : 'Copiar Link'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sharing Instructions */}
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
                  para {mockMessageData.recipientName}
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

        <div className="text-center space-y-4">
          <Link href="/editor/mensagem">
            <Button variant="ghost">Criar Nova Mensagem</Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            Esta é uma página de teste para demonstração
          </p>
        </div>

      </div>
    </div>
  );
}
