import React from 'react';

const AVATAR_COLORS = [
  '#e11d48','#f59e0b','#10b981','#3b82f6',
  '#8b5cf6','#06b6d4','#ec4899','#84cc16','#f97316',
];

export const Avatar: React.FC<{ texto: string; size?: number }> = ({ texto, size = 22 }) => {
  const ini = texto.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const ci  = ini.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: AVATAR_COLORS[ci], color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      boxShadow: '0 0 0 2px #0f1117',
    }}>
      {ini}
    </div>
  );
};
