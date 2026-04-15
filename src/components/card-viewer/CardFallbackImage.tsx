'use client';

/**
 * CSS-based fallback visuals for cards without photos.
 * Zero download — pure gradients and shapes in brand colors.
 * 6 unique variations that cycle for 12 cards.
 */

interface Props {
  variant: number;
  className?: string;
  label?: string;
}

export function CardFallbackImage({ variant, className = '', label }: Props) {
  const v = ((variant % 6) + 6) % 6;
  const styles = VARIANTS[v];

  return (
    <div
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={{ background: styles.bg }}
    >
      {/* Decorative blurred shapes */}
      {styles.shapes.map((shape, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            background: shape.color,
            opacity: shape.opacity,
            filter: `blur(${shape.blur})`,
          }}
        />
      ))}

      {/* Subtle emoji accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] text-7xl select-none pointer-events-none">
        {styles.emoji}
      </div>

      {/* Label overlay */}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-sm font-medium px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm text-[#8B5F5F]">
            📷 {label}
          </span>
        </div>
      )}
    </div>
  );
}

interface Shape {
  size: string;
  x: string;
  y: string;
  color: string;
  opacity: number;
  blur: string;
}

interface VariantStyle {
  bg: string;
  emoji: string;
  shapes: Shape[];
}

const VARIANTS: VariantStyle[] = [
  {
    bg: 'linear-gradient(145deg, #FFFAFA 0%, #F5E6E6 50%, #E6C2C2 100%)',
    emoji: '💌',
    shapes: [
      { size: '180px', x: '-40px', y: '-30px', color: '#E6C2C2', opacity: 0.4, blur: '60px' },
      { size: '140px', x: '70%', y: '60%', color: '#D4A5A5', opacity: 0.3, blur: '50px' },
      { size: '100px', x: '20%', y: '80%', color: '#E6C2C2', opacity: 0.2, blur: '40px' },
    ],
  },
  {
    bg: 'linear-gradient(135deg, #FFF5F5 0%, #FCE4EC 50%, #F8BBD0 100%)',
    emoji: '💕',
    shapes: [
      { size: '200px', x: '60%', y: '-20%', color: '#F8BBD0', opacity: 0.35, blur: '70px' },
      { size: '160px', x: '-10%', y: '50%', color: '#E6C2C2', opacity: 0.3, blur: '55px' },
      { size: '90px', x: '40%', y: '30%', color: '#D4A5A5', opacity: 0.25, blur: '45px' },
    ],
  },
  {
    bg: 'linear-gradient(160deg, #FFFAFA 0%, #F0E6E6 40%, #D4A5A5 100%)',
    emoji: '✨',
    shapes: [
      { size: '220px', x: '50%', y: '40%', color: '#E6C2C2', opacity: 0.35, blur: '80px' },
      { size: '120px', x: '-5%', y: '-5%', color: '#D4A5A5', opacity: 0.3, blur: '50px' },
      { size: '80px', x: '80%', y: '10%', color: '#F5E6E6', opacity: 0.4, blur: '35px' },
    ],
  },
  {
    bg: 'linear-gradient(130deg, #FFF0F0 0%, #F5E6E6 60%, #E6C2C2 100%)',
    emoji: '🌸',
    shapes: [
      { size: '170px', x: '10%', y: '10%', color: '#D4A5A5', opacity: 0.3, blur: '65px' },
      { size: '150px', x: '65%', y: '70%', color: '#E6C2C2', opacity: 0.35, blur: '55px' },
      { size: '110px', x: '50%', y: '-10%', color: '#F8BBD0', opacity: 0.2, blur: '45px' },
    ],
  },
  {
    bg: 'linear-gradient(150deg, #FFFAFA 0%, #FCE4EC 50%, #E6C2C2 100%)',
    emoji: '🎀',
    shapes: [
      { size: '190px', x: '-15%', y: '60%', color: '#E6C2C2', opacity: 0.4, blur: '70px' },
      { size: '130px', x: '75%', y: '5%', color: '#D4A5A5', opacity: 0.3, blur: '50px' },
      { size: '100px', x: '30%', y: '40%', color: '#F5E6E6', opacity: 0.25, blur: '40px' },
    ],
  },
  {
    bg: 'linear-gradient(140deg, #FFF5F5 0%, #F0E0E0 45%, #D4A5A5 100%)',
    emoji: '💝',
    shapes: [
      { size: '200px', x: '40%', y: '-15%', color: '#E6C2C2', opacity: 0.35, blur: '75px' },
      { size: '160px', x: '-10%', y: '70%', color: '#D4A5A5', opacity: 0.3, blur: '60px' },
      { size: '90px', x: '70%', y: '50%', color: '#F8BBD0', opacity: 0.25, blur: '40px' },
    ],
  },
];
