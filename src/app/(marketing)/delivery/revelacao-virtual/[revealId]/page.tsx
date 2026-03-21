'use client';

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowRight, CheckCircle, Copy, Download, ExternalLink, Gift, Loader2, Mail, QrCode, Share2, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { analytics } from "@/lib/analytics";

interface GenderRevealData {
  id: string;
  boyName: string;
  girlName: string;
  actualGender: 'menino' | 'menina';
  dadName: string;
  momName: string;
  storyMessage: string | null;
  slug: string | null;
  dashboardSlug: string | null;
  qrCodeUrl: string | null;
  status: string;
  contactName: string | null;
  contactEmail: string | null;
}

export default function GenderRevealDeliveryPage() {
  const params = useParams();
  const revealId = params.revealId as string;
  
  const [revealData, setRevealData] = useState<GenderRevealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dashboardCopied, setDashboardCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Track conversion when reveal is loaded and paid
  useEffect(() => {
    if (revealData?.status === 'paid') {
      analytics.purchase('gender-reveal', revealData.id, 29.90);
    }
  }, [revealData]);

  useEffect(() => {
    if (!revealId) {
      setError('ID da revelação não encontrado');
      setLoading(false);
      return;
    }

    fetch(`/api/gender-reveal/${revealId}`)
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar dados da revelação');
        return res.json();
      })
      .then(data => {
        setRevealData(data.reveal);
        setLoading(false);
        setEmailSent(data.reveal.status === 'paid');
      })
      .catch(err => {
        console.error('Error fetching reveal:', err);
        setError('Não foi possível carregar os dados da revelação');
        setLoading(false);
      });
  }, [revealId]);

  // Public URL for guests to vote
  const publicUrl = revealData?.slug 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/revelacao-virtual/${revealData.slug}`
    : null;

  // Dashboard URL for the buyer
  const dashboardUrl = revealData?.dashboardSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/revelacao-virtual/dashboard/${revealData.dashboardSlug}`
    : null;

  const handleCopyLink = async () => {
    if (publicUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        analytics.shareLink(revealId, 'gender-reveal', 'copy');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleCopyDashboardLink = async () => {
    if (dashboardUrl) {
      try {
        await navigator.clipboard.writeText(dashboardUrl);
        setDashboardCopied(true);
        analytics.shareLink(revealId, 'gender-reveal', 'copy');
        setTimeout(() => setDashboardCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDownloadQRCode = () => {
    if (revealData?.qrCodeUrl) {
      analytics.downloadQRCode(revealId, 'gender-reveal');
      const link = document.createElement('a');
      link.href = revealData.qrCodeUrl;
      link.download = `qrcode-revelacao-${revealData.boyName}-ou-${revealData.girlName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto" />
          <p className="text-gray-600">Carregando sua revelação...</p>
        </div>
      </div>
    );
  }

  if (error || !revealData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error || 'Revelação não encontrada'}</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white">Voltar para o Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const babyName = revealData.actualGender === 'menino' ? revealData.boyName : revealData.girlName;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-pink-50 py-12 pt-24">
      <div className="container px-4 md:px-8 max-w-3xl mx-auto space-y-8">

        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-800">
            🎉 Sua Revelação Está Pronta!
          </h1>
          <p className="text-lg text-gray-600">
            A revelação de <strong className={revealData.actualGender === 'menino' ? 'text-blue-600' : 'text-pink-600'}>{babyName}</strong> foi criada com sucesso!
          </p>
        </div>

        {/* Email Confirmation */}
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
                    Enviamos os links e o QR Code para o seu email. 
                    Verifique sua caixa de entrada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code and Public Link */}
        <Card className="border-pink-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-pink-500" />
              Link para Convidados
            </CardTitle>
            <CardDescription>
              Compartilhe este link para que as pessoas votem
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* QR Code */}
            {revealData.qrCodeUrl ? (
              <div className="w-64 h-64 bg-white border-4 border-pink-200 rounded-xl flex items-center justify-center shadow-inner p-4">
                <Image 
                  src={revealData.qrCodeUrl} 
                  alt="QR Code da revelação"
                  width={240}
                  height={240}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-white border-4 border-pink-200 rounded-xl flex flex-col items-center justify-center shadow-inner p-4">
                <QrCode className="w-32 h-32 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  QR Code em processamento...
                </p>
              </div>
            )}

            {/* Public Link */}
            {publicUrl && (
              <div className="w-full max-w-md space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Link para votação:
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={publicUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyLink}
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
                disabled={!revealData.qrCodeUrl}
              >
                <Download className="w-4 h-4" />
                Baixar QR
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleCopyLink}
                disabled={!publicUrl}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button 
                className="gap-2 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
                onClick={() => publicUrl && window.open(publicUrl, '_blank')}
                disabled={!publicUrl}
              >
                <ExternalLink className="w-4 h-4" />
                Abrir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Link */}
        <Card className="border-purple-200 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              Seu Dashboard Exclusivo
            </CardTitle>
            <CardDescription>
              Acompanhe os votos e mensagens dos convidados
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {dashboardUrl && (
              <div className="w-full max-w-md space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Link do dashboard (só para você):
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={dashboardUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-purple-200 rounded-md bg-white text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyDashboardLink}
                    className="px-3 border-purple-200"
                  >
                    {dashboardCopied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Button 
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              onClick={() => dashboardUrl && window.open(dashboardUrl, '_blank')}
              disabled={!dashboardUrl}
            >
              <ArrowRight className="w-4 h-4" />
              Acessar Dashboard
            </Button>
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
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold mt-0.5">1.</span>
                <span>
                  <strong>WhatsApp:</strong> Envie o QR Code ou o link para seus convidados votarem
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold mt-0.5">2.</span>
                <span>
                  <strong>Imprimir:</strong> Baixe o QR Code e imprima para usar na festa
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold mt-0.5">3.</span>
                <span>
                  <strong>Redes Sociais:</strong> Compartilhe nos stories para mais pessoas participarem
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500 font-bold mt-0.5">4.</span>
                <span>
                  <strong>Dashboard:</strong> Guarde o link do dashboard para acompanhar os votos em tempo real
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Cross-sell */}
        <div className="bg-gradient-to-r from-blue-100 to-pink-100 rounded-2xl p-8 border border-pink-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-bold text-pink-600 uppercase tracking-wide">
                Dica
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-800">
                Imprima o QR Code para a festa!
              </h2>
              <p className="text-gray-600">
                Coloque o QR Code em um quadro ou cartaz para que os convidados possam votar durante o chá revelação.
              </p>
            </div>
            <div className="w-full md:w-48 h-48 bg-white rounded-lg shadow-md flex items-center justify-center shrink-0 rotate-3 hover:rotate-0 transition-transform duration-300">
              <QrCode className="w-16 h-16 text-pink-400" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link href="/">
            <Button variant="ghost">Voltar para o Início</Button>
          </Link>
          <p className="text-xs text-gray-400">
            Precisa de ajuda? Entre em contato conosco
          </p>
        </div>

      </div>
    </div>
  );
}
