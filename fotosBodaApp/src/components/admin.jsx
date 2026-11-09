import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [fotosPendientes, setFotosPendientes] = useState([]);
  const [loadingFotos, setLoadingFotos] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(null);

  async function cargarPendientes() {
    setLoadingFotos(true);
    const { data, error } = await supabase
      .from('fotos')
      .select('*')
      .eq('aprobado', false);

    if (error) {
      console.error('Error al cargar fotos:', error);
    } else {
      setFotosPendientes(data || []);
    }
    setLoadingFotos(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
      if (session) cargarPendientes();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cargarPendientes();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Manejo de eventos de teclado (Carrusel circular y Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null || fotosPendientes.length === 0) return;
      
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev < fotosPendientes.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : fotosPendientes.length - 1));
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, fotosPendientes.length]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const aprobarFoto = async (id) => {
    const { error } = await supabase
      .from('fotos')
      .update({ aprobado: true })
      .eq('id', id);

    if (error) {
      alert('Error al aprobar la foto');
    } else {
      const nuevasFotos = fotosPendientes.filter(foto => foto.id !== id);
      setFotosPendientes(nuevasFotos);
      if (nuevasFotos.length === 0) {
        setSelectedIndex(null);
      } else if (selectedIndex >= nuevasFotos.length) {
        setSelectedIndex(0);
      }
    }
  };

  const eliminarFoto = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return;
    
    const { error } = await supabase
      .from('fotos')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error al eliminar la foto');
    } else {
      const nuevasFotos = fotosPendientes.filter(foto => foto.id !== id);
      setFotosPendientes(nuevasFotos);
      if (nuevasFotos.length === 0) {
        setSelectedIndex(null);
      } else if (selectedIndex >= nuevasFotos.length) {
        setSelectedIndex(0);
      }
    }
  };

  const handleNext = () => {
    if (fotosPendientes.length === 0) return;
    setSelectedIndex((prev) => (prev < fotosPendientes.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    if (fotosPendientes.length === 0) return;
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : fotosPendientes.length - 1));
  };

  if (loadingAuth) {
    return <div style={styles.adminContainer}><p style={{ color: '#cbd5e1' }}>Cargando...</p></div>;
  }

  if (!session) {
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
            <button type="submit" style={styles.approveBtn}>Iniciar Sesión</button>
          </form>
        </div>
      </div>
    );
  }

  const fotoActual = selectedIndex !== null && fotosPendientes[selectedIndex] ? fotosPendientes[selectedIndex] : null;

  return (
    <div style={styles.adminContainer}>
      {/* Cabecera */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.mainTitle}>Panel de Moderación</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
      </div>

      {loadingFotos ? (
        <p style={{ color: '#cbd5e1', marginTop: '40px' }}>Cargando fotos pendientes...</p>
      ) : fotosPendientes.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ color: '#cbd5e1', fontSize: '18px' }}>¡No hay fotos pendientes de moderar por ahora!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {fotosPendientes.map((foto, index) => (
            <div 
              key={foto.id} 
              style={styles.adminCard} 
              onClick={() => setSelectedIndex(index)}
            >
              <div style={styles.adminImageWrapper}>
                <img src={foto.url_imagen} alt="Subida por invitado" style={styles.adminImage} />
              </div>
              <div style={styles.adminInfo}>
                <p style={styles.adminName}><strong>De:</strong> {foto.nombre_invitado || 'Anónimo'}</p>
                <p style={styles.adminMsg}><strong>Mensaje:</strong> {foto.mensaje || 'Sin mensaje'}</p>
                <span style={styles.clickHint}>🔍 Toca para ampliar</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL LIGHTBOX */}
      {fotoActual && (
        <div style={styles.modalOverlay} onClick={() => setSelectedIndex(null)}>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
            style={{ ...styles.sideNavBtn, left: '20px' }}
            title="Anterior (Flecha Izquierda)"
          >
            ❮
          </button>

          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <button style={styles.closeModalBtn} onClick={() => setSelectedIndex(null)}>✕</button>

            <div style={styles.modalImageContainer}>
              <img src={fotoActual.url_imagen} alt="Vista ampliada" style={styles.modalImage} />
              <div style={styles.counterBadge}>
                {selectedIndex + 1} / {fotosPendientes.length}
              </div>
            </div>

            <div style={styles.modalSidebar}>
              <div>
                <h2 style={{ color: '#f8fafc', marginTop: '0', fontSize: '22px' }}>Moderación de Recuerdo</h2>
                
                <div style={styles.detailGroup}>
                  <label style={styles.detailLabel}>Quien subió:</label>
                  <p style={styles.detailValue}>{fotoActual.nombre_invitado || 'Anónimo'}</p>
                </div>

                <div style={styles.detailGroup}>
                  <label style={styles.detailLabel}>Dedicatoria:</label>
                  <p style={styles.detailMsg}>{fotoActual.mensaje || 'Sin dedicatoria escrita...'}</p>
                </div>
              </div>

              <div style={styles.modalActionButtons}>
                <button 
                  onClick={() => aprobarFoto(fotoActual.id)} 
                  style={styles.approveBtnModal}
                >
                  Aprobar
                </button>
                <button 
                  onClick={() => eliminarFoto(fotoActual.id)} 
                  style={styles.deleteBtnModal}
                >
                  Rechasar
                </button>
              </div>
            </div>

          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }} 
            style={{ ...styles.sideNavBtn, right: '20px' }}
            title="Siguiente (Flecha Derecha)"
          >
            ❯
          </button>

        </div>
      )}
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
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1100px',
    marginBottom: '35px',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '20px',
  },
  mainTitle: {
    color: '#f8fafc',
    fontSize: '28px',
    margin: '0 0 4px 0',
    fontWeight: '700',
  },
  subTitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: '0',
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
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
    marginTop: '100px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
    width: '100%',
    maxWidth: '1100px',
  },
  adminCard: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #334155',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  adminImageWrapper: {
    width: '100%',
    height: '180px',
    backgroundColor: '#050b14',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  adminImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  adminInfo: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    color: '#f8fafc',
    fontSize: '13px',
  },
  adminName: {
    margin: '0',
  },
  adminMsg: {
    margin: '0',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  clickHint: {
    color: '#38bdf8',
    fontSize: '11px',
    marginTop: '6px',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '80px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    overflow: 'hidden',
    width: '1050px',
    height: '600px',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    border: '1px solid #334155',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
  },
  closeModalBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '16px',
    cursor: 'pointer',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    width: '650px',
    height: '100%',
    backgroundColor: '#050b14',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: '20px',
    boxSizing: 'border-box',
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  counterBadge: {
    position: 'absolute',
    bottom: '16px',
    left: '20px',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  modalSidebar: {
    width: '400px',
    height: '100%',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    boxSizing: 'border-box',
  },
  detailGroup: {
    marginBottom: '20px',
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
  },
  detailValue: {
    color: '#f8fafc',
    fontSize: '17px',
    margin: '0',
    fontWeight: '600',
  },
  detailMsg: {
    color: '#e2e8f0',
    fontSize: '15px',
    margin: '0',
    fontStyle: 'italic',
    lineHeight: '1.5',
    backgroundColor: '#0f172a',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #334155',
    maxHeight: '180px',
    overflowY: 'auto',
  },
  modalActionButtons: {
    display: 'flex',
    gap: '12px',
  },
  approveBtnModal: {
    flex: 1,
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '15px',
  },
  deleteBtnModal: {
    flex: 1,
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '15px',
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
  sideNavBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    color: '#fff',
    border: '1px solid #475569',
    borderRadius: '50%',
    width: '56px',
    height: '56px',
    fontSize: '22px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1010,
    transition: 'background-color 0.2s',
  }
};