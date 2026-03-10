import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      color: '#64748b',
    }}>
      <span style={{ fontSize: 52 }}>🔍</span>
      <span style={{ fontSize: 20, fontWeight: 700, color: '#94a3b8' }}>Página no encontrada</span>
      <button
        onClick={() => navigate('/')}
        style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 20px', color: '#60a5fa', fontSize: 13, cursor: 'pointer' }}
      >
        ← Volver al tablero
      </button>
    </div>
  );
}
