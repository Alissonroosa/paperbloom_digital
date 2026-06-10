'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowRight, CheckCircle, Copy, Download, ExternalLink, Loader2, Mail, QrCode, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { analytics } from '@/lib/analytics';

interface BabyShowerData {
  id: string;
  babyName: string | null;
  hostName: string;
  partnerName: string | null;
  slug: string | null;
  dashboardSlug: string | null;
  qrCodeUrl: string | null;
  status: string;
  contactName: string | null;
  contactEmail: string | null;
}

export default function ChaDeFraldaDeliveryPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<BabyShowerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dashboardCopied, setDashboardCopied] = useState(false);

  useEffect(() => {
    if (event?.status === 'paid') {
      analytics.purchase('baby-shower', event.id, 19.9);
    }
  }, [event]);

  useEffect(() => {
    if (!id) {
      setError('ID do chá de fralda não encontrado');
      setLoading(false);
      return;
    }
    fetch(`/api/baby-shower/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar dados');
        return res.json();
      })
      .then((data) => {
        setEvent(data.babyShower);
        setLoading(false);
      })
      .catch(() => {
        setError('Não foi possível carregar os dados do chá de fralda');
        setLoading(false);
      });
  }, [id]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = event?.slug ? `${origin}/cha-de-fralda/${event.slug}` : null;
  const dashboardUrl = event?.dashboardSlug ? `${origin}/cha-de-fralda/dashboard/${event.dashboardSlug}` : null;

  const handleCopyLink = async () => {
    if (publicUrl) {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      analytics.shareLink(id, 'baby-shower', 'copy');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyDashboard = async () => {
    if (dashboardUrl) {
      await navigator.clipboard.writeText(dashboardUrl);
      setDashboardCopied(true);
      analytics.shareLink(id, 'baby-shower', 'copy');
      setTimeout(() => setDashboardCopied(false), 2000);
    }
  };

  const handleDownloadQRCode = () => {
    if (event?.qrCodeUrl) {
      analytics.downloadQRCode(id, 'baby-shower');
      const link = document.createElement('a');
      link.href = event.qrCodeUrl;
      link.download = `qrcode-cha-de-fralda-${event.hostName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto" />
          <p className="text-gray-600">Carregando seu chá de fralda...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error || 'Chá de fralda não encontrado'}</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-text-main">Voltar para o Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 py-12 pt-24">
      <div className="container px-4 md:px-8 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-800">🍼 Seu Chá de Fralda está pronto!</h1>
          <p className="text-lg text-gray-600">
            O convite {event.babyName ? `do(a) ${event.babyName}` : `de ${event.hostName}`} foi criado com sucesso.
          </p>
        </div>

        {event.status === 'paid' && (
          <Card className="border-pink-200 bg-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-pink-900">Email enviado com sucesso!</p>
                  <p className="text-sm text-pink-700 mt-1">
                    Enviamos o link do convite, o painel e o QR Code para o seu email.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-pink-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-pink-500" />
              Link para Convidados
            </CardTitle>
            <CardDescription>Compartilhe este link com quem você quer convidar</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {event.qrCodeUrl ? (
              <div className="w-64 h-64 bg-white border-4 border-pink-200 rounded-xl flex items-center justify-center shadow-inner p-4">
                <Image src={event.qrCodeUrl} alt="QR Code do convite" width={240} height={240} className="w-full h-full object-contain" priority />
              </div>
            ) : (
              <div className="w-64 h-64 bg-white border-4 border-pink-200 rounded-xl flex flex-col items-center justify-center shadow-inner p-4">
                <QrCode className="w-32 h-32 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2 text-center">QR Code em processamento...</p>
              </div>
            )}

            {publicUrl && (
              <div className="w-full max-w-md space-y-2">
                <label className="text-sm font-medium text-gray-600">Link do convite:</label>
                <div className="flex gap-2">
                  <input type="text" value={publicUrl} readOnly className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm" />
                  <Button variant="outline" size="sm" onClick={handleCopyLink} className="px-3">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
              <Button variant="outline" className="gap-2" onClick={handleDownloadQRCode} disabled={!event.qrCodeUrl}>
                <Download className="w-4 h-4" />
                Baixar QR
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleCopyLink} disabled={!publicUrl}>
                <Copy className="w-4 h-4" />
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 text-text-main"
                onClick={() => publicUrl && window.open(publicUrl, '_blank')}
                disabled={!publicUrl}
              >
                <ExternalLink className="w-4 h-4" />
                Abrir
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-lg bg-gradient-to-r from-rose-50 to-pink-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-rose-500" />
              Seu Painel Privado
            </CardTitle>
            <CardDescription>Acompanhe confirmações, presentes e recados</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {dashboardUrl && (
              <div className="w-full max-w-md space-y-2">
                <label className="text-sm font-medium text-gray-600">Link do painel (só para você):</label>
                <div className="flex gap-2">
                  <input type="text" value={dashboardUrl} readOnly className="flex-1 px-3 py-2 border border-rose-200 rounded-md bg-white text-sm" />
                  <Button variant="outline" size="sm" onClick={handleCopyDashboard} className="px-3 border-rose-200">
                    {dashboardCopied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
            <Button
              size="lg"
              className="gap-2 bg-rose-400 hover:bg-rose-500 text-white"
              onClick={() => dashboardUrl && window.open(dashboardUrl, '_blank')}
              disabled={!dashboardUrl}
            >
              <ArrowRight className="w-4 h-4" />
              Acessar Painel
            </Button>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Link href="/">
            <Button variant="ghost">Voltar para o Início</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
