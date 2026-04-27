export interface ShareMessageInput {
  recipientName: string;
  senderName: string;
  url: string;
}

export function buildShareMessage(input: ShareMessageInput): string {
  return `${input.recipientName}, preparei um presente especial pra você 💌\n\nPode abrir quando estiver com um momento só seu:\n${input.url}\n\nCom carinho,\n${input.senderName}`;
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
