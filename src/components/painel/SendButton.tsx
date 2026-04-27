'use client';

interface SendButtonProps {
  recipientName: string;
  onClick: () => void;
}

export function SendButton({ recipientName, onClick }: SendButtonProps) {
  const label = recipientName.length > 30
    ? `Enviar para ${recipientName.slice(0, 30)}…`
    : `Enviar para ${recipientName}`;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#8B5F5F] text-white rounded-2xl font-serif text-lg font-semibold hover:bg-[#4A4A4A] transition-colors shadow-md"
      aria-label={label}
    >
      <span>💌</span>
      <span>{label}</span>
    </button>
  );
}
