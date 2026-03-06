import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Props {
  active: boolean;
}

export default function ConfettiEffect({ active }: Props) {
  useEffect(() => {
    if (!active) return;

    // Subtle, short confetti burst
    const defaults = {
      spread: 60,
      ticks: 40,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 20,
      colors: ['#0d9488', '#5eead4', '#f59e0b', '#8b5cf6', '#ec4899', '#22c55e'],
    };

    confetti({
      ...defaults,
      particleCount: 30,
      scalar: 0.8,
      origin: { x: 0.5, y: 0.6 },
    });

    confetti({
      ...defaults,
      particleCount: 15,
      scalar: 1.1,
      origin: { x: 0.4, y: 0.65 },
    });

    confetti({
      ...defaults,
      particleCount: 15,
      scalar: 1.1,
      origin: { x: 0.6, y: 0.65 },
    });
  }, [active]);

  return null;
}
