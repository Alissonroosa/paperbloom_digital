import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { CreditCard, Lock, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container px-4 md:px-8 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-text-main">Finalizar Compra</h1>
                    <p className="text-muted-foreground">Você está a um passo de emocionar quem ama.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo do Pedido</CardTitle>
                            <CardDescription>Confira os detalhes da sua compra</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium">Mensagem Personalizada</span>
                                <span>R$ 19,90</span>
                            </div>
                            <div className="flex justify-between items-center py-2 font-bold text-lg">
                                <span>Total</span>
                                <span className="text-primary">R$ 19,90</span>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-md text-sm text-muted-foreground flex gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                <p>Garantia de satisfação de 7 dias. Se não gostar, devolvemos seu dinheiro.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form (Mock) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Pagamento Seguro
                            </CardTitle>
                            <CardDescription>Seus dados estão protegidos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="card-name">Nome no Cartão</Label>
                                <Input id="card-name" placeholder="Como está no cartão" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="card-number">Número do Cartão</Label>
                                <div className="relative">
                                    <Input id="card-number" placeholder="0000 0000 0000 0000" />
                                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Validade</Label>
                                    <Input id="expiry" placeholder="MM/AA" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" placeholder="123" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href="/success" className="w-full">
                                <Button className="w-full h-12 text-lg shadow-lg">
                                    Pagar R$ 19,90
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
