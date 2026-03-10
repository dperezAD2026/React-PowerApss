import React from 'react';
import type { Etiqueta } from '../../store/data';

export const EtiquetaBadge: React.FC<{ e: Etiqueta }> = ({ e }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 8px', borderRadius: 20,
    background: e.bg, color: e.color,
    border: `1px solid ${e.border}50`,
    fontSize: 11, fontWeight: 600,
    whiteSpace: 'nowrap', lineHeight: '16px',
  }}>
    {e.label}
  </span>
);
