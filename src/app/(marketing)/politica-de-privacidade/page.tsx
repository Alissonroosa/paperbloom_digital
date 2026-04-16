import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Paper Bloom Digital",
  description: "Política de Privacidade da Paper Bloom Digital. Saiba como coletamos, usamos e protegemos seus dados pessoais.",
};

export default function PoliticaDePrivacidade() {
  return (
    <div className="container mx-auto max-w-screen-md px-6 py-16">
      <h1 className="font-playfair text-3xl md:text-4xl font-bold text-center mb-2">
        Política de Privacidade
      </h1>
      <p className="text-center text-muted-foreground mb-12">
        Última atualização: 16 de abril de 2026
      </p>

      <div className="prose prose-neutral max-w-none space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Introdução</h2>
          <p>
            A Paper Bloom Digital (&quot;nós&quot;, &quot;nosso&quot; ou &quot;empresa&quot;) valoriza a privacidade dos seus usuários.
            Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos
            suas informações pessoais quando você utiliza nosso site e serviços.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Dados que Coletamos</h2>
          <p>Podemos coletar os seguintes tipos de informações:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nome e informações de contato (e-mail, telefone)</li>
            <li>Dados de pagamento processados de forma segura via Stripe</li>
            <li>Conteúdo das mensagens e imagens enviadas para criação dos produtos</li>
            <li>Dados de navegação e uso do site (cookies, endereço IP, tipo de navegador)</li>
            <li>Informações fornecidas voluntariamente via formulários de contato</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Como Usamos seus Dados</h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Processar e entregar seus pedidos de mensagens digitais e produtos personalizados</li>
            <li>Processar pagamentos de forma segura</li>
            <li>Enviar comunicações relacionadas ao seu pedido</li>
            <li>Melhorar nossos serviços e experiência do usuário</li>
            <li>Cumprir obrigações legais e regulatórias</li>
            <li>Análise de uso do site via Google Analytics e Meta Pixel</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Compartilhamento de Dados</h2>
          <p>
            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros,
            exceto nas seguintes situações:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Processadores de pagamento (Stripe) para concluir transações</li>
            <li>Serviços de análise (Google Analytics, Meta Pixel) para melhorar nosso site</li>
            <li>Quando exigido por lei ou ordem judicial</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Armazenamento e Segurança</h2>
          <p>
            Seus dados são armazenados em servidores seguros e adotamos medidas técnicas e
            organizacionais adequadas para proteger suas informações contra acesso não autorizado,
            alteração, divulgação ou destruição. Os dados de pagamento são processados diretamente
            pelo Stripe e não são armazenados em nossos servidores.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
          <p>
            Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência de navegação,
            analisar o tráfego do site e personalizar conteúdo. Você pode configurar seu navegador
            para recusar cookies, mas isso pode afetar a funcionalidade do site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Seus Direitos (LGPD)</h2>
          <p>
            De acordo com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você tem direito a:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Confirmar a existência de tratamento de seus dados pessoais</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Solicitar a portabilidade dos dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Retenção de Dados</h2>
          <p>
            Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades
            para as quais foram coletados, incluindo obrigações legais, contábeis ou de relatório.
            O conteúdo das mensagens e imagens pode ser excluído após a entrega do produto, mediante solicitação.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Quaisquer alterações
            serão publicadas nesta página com a data de atualização revisada. Recomendamos que
            você revise esta página regularmente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos
            seus dados pessoais, entre em contato conosco:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>E-mail: contato@paperbloom.com.br</li>
            <li>WhatsApp: (51) 99269-8003</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
