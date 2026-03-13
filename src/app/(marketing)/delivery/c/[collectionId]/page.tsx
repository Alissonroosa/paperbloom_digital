'use client';

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowRight, CheckCircle, Copy, Download, Gift, Heart, Loader2, Mail, QrCode, Share2, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface CardCollectionData {
  id: string;
  recipientName: string;
  senderName: string;
  slug: string | null;
  qrCodeUrl: string | null;
  status: string;
  introMessage: string | null;
  youtubeVideoId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactName: string | null;
}

/**
 * Delivery Page Component for Card Collections
 * Displays QR code and collection URL after successful payment
 */
export default function CardCollectionDeliveryPage() {
  const params = useParams();
  const collectionId = params.collectionId as string;
  
  const [collectionData, setCollectionData] = useState<CardCollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!collectionId) {
      setError('ID da coleção não encontrado');
      setLoading(false);
      return;
    }

    // Fetch collection data using collection ID
    fetch(`/api/card-collections/${collectionId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Falha ao carregar dados da coleção');
        }
        return res.json();
      })
      .then(data => {
        // A API retorna { collection, cards }, então pegamos apenas collection
        setCollectionData(data.collection);
        setLoading(false);
        // Check if email was sent (this would be set by the webhook)
        setEmailSent(data.collection.status === 'paid');
      })
      .catch(err => {
        console.error('Error fetching collection:', err);
        setError('Não foi possível carregar os dados da coleção');
        setLoading(false);
      });
  }, [collectionId]);

  // The slug already contains the full path: /c/{name}/{id}
  const collectionUrl = collectionData?.slug 
    ? `${window.location.origin}${collectionData.slug}`
    : null;

  const handleCopyLink = async () => {
    if (collectionUrl) {
      try {
        await navigator.clipboard.writeText(collectionUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDownloadQRCode = () => {
    if (collectionData?.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = collectionData.qrCodeUrl;
      link.download = `qrcode-12cartas-${collectionData.recipientName.replace(/\s+/g, '-')}.png`;
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
          <p className="text-muted-foreground">Carregando suas 12 cartas...</p>
        </div>
      </div>
    );
  }

  if (error || !collectionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error || 'Coleção não encontrada'}</p>
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

        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-text-main">
            Suas 12 Cartas Estão Prontas!
          </h1>
          <p className="text-lg text-muted-foreground">
            Sua coleção de cartas para <strong>{collectionData.recipientName}</strong> foi criada com sucesso!
          </p>
        </div>

        {/* Email Confirmation Message */}
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
                    Enviamos o QR Code e o link das 12 cartas para o seu email. 
                    Verifique sua caixa de entrada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collection Preview Section */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Preview das Suas 12 Cartas
            </CardTitle>
            <CardDescription>
              Veja como sua coleção ficou antes de compartilhar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recipient and Sender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-border">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Para</p>
                  <p className="font-medium">{collectionData.recipientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">De</p>
                  <p className="font-medium">{collectionData.senderName}</p>
                </div>
              </div>
            </div>

            {/* Intro Message */}
            {collectionData.introMessage && (
              <div className="bg-muted/50 rounded-lg p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Mensagem de Abertura
                </p>
                <p className="text-lg leading-relaxed text-text-main whitespace-pre-wrap">
                  {collectionData.introMessage}
                </p>
              </div>
            )}

            {/* Collection Info */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 text-center">
              <p className="text-2xl font-serif font-bold text-text-main mb-2">
                12 Cartas Personalizadas
              </p>
              <p className="text-sm text-muted-foreground">
                Uma jornada de amor e memórias em 12 momentos especiais
              </p>
            </div>
          </CardContent>
        </Card>

        {/* QR Code and Link Display */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Suas 12 Cartas Digitais</CardTitle>
            <CardDescription>Compartilhe com {collectionData.recipientName}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* QR Code Image */}
            {collectionData.qrCodeUrl ? (
              <div className="w-64 h-64 bg-white border-4 border-primary/20 rounded-xl flex items-center justify-center shadow-inner p-4">
                <Image 
                  src={collectionData.qrCodeUrl} 
                  alt="QR Code das 12 cartas"
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

            {/* Shareable Link */}
            {collectionUrl && (
              <div className="w-full max-w-md space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Link compartilhável:
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={collectionUrl}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleDownloadQRCode}
                disabled={!collectionData.qrCodeUrl}
              >
                <Download className="w-4 h-4" />
                Baixar QR Code
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleCopyLink}
                disabled={!collectionUrl}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copiado!' : 'Copiar Link'}
              </Button>
              <Button 
                variant="primary" 
                className="gap-2"
                onClick={() => collectionUrl && window.open(collectionUrl, '_blank')}
                disabled={!collectionUrl}
              >
                <ArrowRight className="w-4 h-4" />
                Abrir Link
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
                  para {collectionData.recipientName}
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
                  câmera do celular para acessar as 12 cartas
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
                Podemos imprimir suas 12 cartas em um álbum personalizado ou em cartões individuais.
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
