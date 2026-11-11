import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
      setLoading(false);
    } else {
      navigate('/admin'); // Redirige al panel al autenticarse
    }
  };

  return (
    <div style={styles.adminContainer}>
      <div style={styles.loginCard}>
        <h1 style={{ color: '#f8fafc', marginBottom: '8px', fontSize: '22px' }}>Acceso Novios</h1>
        <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>Inicia sesión para moderar los recuerdos</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.approveBtn}>
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  adminContainer: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#0f172a',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  loginCard: {
    backgroundColor: '#1e293b',
    padding: '30px',
    borderRadius: '16px',
    border: '1px solid #334155',
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  },
  input: {
    backgroundColor: '#0f172a',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '12px',
    color: '#f8fafc',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  approveBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    fontSize: '15px',
  },
};