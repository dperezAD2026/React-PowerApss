import React from 'react';

export const BarraAvance: React.FC<{ pct: number; color: string }> = ({ pct, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
    <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: color, borderRadius: 4,
        transition: 'width .4s',
      }} />
    </div>
    <span style={{ fontSize: 10, color: '#64748b', width: 28, textAlign: 'right', flexShrink: 0 }}>
      {pct}%
    </span>
  </div>
);
