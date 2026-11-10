import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Gallery() {
  const [fotosAprobadas, setFotosAprobadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    async function cargarGaleria() {
      setLoading(true);
      const { data, error } = await supabase
        .from("fotos")
        .select("*")
        .eq("aprobado", true)
        .order("subido", { ascending: true });

      if (error) {
        console.error("Error al cargar la galería:", error);
      } else {
        setFotosAprobadas(data || []);
      }
      setLoading(false);
    }
    cargarGaleria();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null || fotosAprobadas.length === 0) return;

      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev < fotosAprobadas.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : fotosAprobadas.length - 1,
        );
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, fotosAprobadas.length]);

  const handleNext = () => {
    if (fotosAprobadas.length === 0) return;
    setSelectedIndex((prev) =>
      prev < fotosAprobadas.length - 1 ? prev + 1 : 0,
    );
  };

  const handlePrev = () => {
    if (fotosAprobadas.length === 0) return;
    setSelectedIndex((prev) =>
      prev > 0 ? prev - 1 : fotosAprobadas.length - 1,
    );
  };

  const fotoActual =
    selectedIndex !== null && fotosAprobadas[selectedIndex]
      ? fotosAprobadas[selectedIndex]
      : null;

  return (
    <div style={styles.galleryContainer}>
      {/* Estilos responsivos optimizados para móvil a pantalla casi completa */}
      <style>{`
        @media (max-width: 768px) {
          .modal-overlay-custom {
            padding: 0 !important;
            background-color: rgba(0, 0, 0, 0.95) !important;
          }
          .modal-content-custom {
            flex-direction: column !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          .modal-image-container-custom {
            width: 100% !important;
            flex: 1 !important;
            height: auto !important;
            padding: 8px !important;
            background-color: #000 !important;
          }
          .modal-image-custom {
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: contain !important;
          }
          .modal-sidebar-custom {
            width: 100% !important;
            height: auto !important;
            max-height: 200px !important;
            padding: 12px 16px !important;
            background-color: #1e293b !important;
            border-top: 1px solid #334155;
          }
          .mobile-nav-bar {
            display: flex !important;
          }
          .desktop-nav-btn {
            display: none !important;
          }
          .counter-badge-custom {
            top: 12px !important;
            left: 12px !important;
            bottom: auto !important;
          }
          .close-modal-btn-custom {
            top: 12px !important;
            right: 12px !important;
            z-index: 50 !important;
          }
        }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>Álbum de Recuerdos</h1>
        <h1 style={styles.title}>Boda Fátima y Rodrigo</h1>
        <p style={styles.subtitle}>
          Momentos inolvidables capturados por nuestros invitados
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#cbd5e1", marginTop: "40px", fontSize: "16px" }}>
          Abriendo el álbum...
        </p>
      ) : fotosAprobadas.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ color: "#cbd5e1", fontSize: "18px" }}>
            El álbum aún está vacío. ¡Sé el primero en subir una foto!
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {fotosAprobadas.map((foto, index) => (
            <div
              key={foto.id}
              style={styles.polaroidCard}
              onClick={() => setSelectedIndex(index)}
            >
              <div style={styles.polaroidImageWrapper}>
                <img
                  src={foto.url_imagen}
                  alt="Recuerdo de boda"
                  style={styles.polaroidImage}
                />
              </div>
              <div style={styles.polaroidFooter}>
                <p style={styles.guestName}>
                  {foto.nombre_invitado || "Anónimo"}
                </p>
                <p style={styles.guestMsg}>
                  {foto.mensaje || "Sin dedicatoria"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL LIGHTBOX */}
      {fotoActual && (
        <div
          style={styles.modalOverlay}
          className="modal-overlay-custom"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Botón Izquierda (Solo visible en PC) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            style={{ ...styles.sideNavBtn, left: "20px" }}
            className="desktop-nav-btn"
            title="Anterior"
          >
            ❮
          </button>

          <div
            style={styles.modalContent}
            className="modal-content-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={styles.closeModalBtn}
              className="close-modal-btn-custom"
              onClick={() => setSelectedIndex(null)}
            >
              ✕
            </button>

            {/* Contenedor de la Foto a Pantalla Completa en Móvil */}
            <div
              style={styles.modalImageContainer}
              className="modal-image-container-custom"
            >
              <img
                src={fotoActual.url_imagen}
                alt="Vista ampliada"
                style={styles.modalImage}
                className="modal-image-custom"
              />
              <div style={styles.counterBadge} className="counter-badge-custom">
                {selectedIndex + 1} / {fotosAprobadas.length}
              </div>
            </div>

            {/* Contenedor de Textos y Barra de Navegación Móvil */}
            <div style={styles.modalSidebar} className="modal-sidebar-custom">
              <div>
                <div style={styles.detailGroup}>
                  <label style={styles.detailLabel}>Subido por:</label>
                  <p style={styles.detailValue}>
                    {fotoActual.nombre_invitado || "Anónimo"}
                  </p>
                </div>

                <div style={styles.detailGroup}>
                  <label style={styles.detailLabel}>Dedicatoria:</label>
                  <p style={styles.detailMsg}>
                    {fotoActual.mensaje || "Sin dedicatoria escrita..."}
                  </p>
                </div>
              </div>

              {/* Barra Inferior para Celular */}
              <div style={styles.mobileNavBar} className="mobile-nav-bar">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  style={styles.mobileNavBtn}
                >
                  ❮ Anterior
                </button>
                <span style={styles.mobileCounter}>
                  {selectedIndex + 1} / {fotosAprobadas.length}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  style={styles.mobileNavBtn}
                >
                  Siguiente ❯
                </button>
              </div>
            </div>
          </div>

          {/* Botón Derecha (Solo visible en PC) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            style={{ ...styles.sideNavBtn, right: "20px" }}
            className="desktop-nav-btn"
            title="Siguiente"
          >
            ❯
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  galleryContainer: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#0f172a",
    padding: "40px 20px 80px 20px",
    fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    width: "100%",
  },
  title: {
    color: "#f8fafc",
    fontSize: "34px",
    margin: "0 0 8px 0",
    fontWeight: "700",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "16px",
    margin: "0 0 16px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "30px",
    width: "100%",
    maxWidth: "1100px",
  },
  polaroidCard: {
    backgroundColor: "#ffffff",
    padding: "14px 14px 24px 14px",
    borderRadius: "4px",
    boxShadow: "0 12px 25px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0,0,0,0.2)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },
  polaroidImageWrapper: {
    width: "100%",
    height: "240px",
    backgroundColor: "#000000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  polaroidImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  polaroidFooter: {
    paddingTop: "16px",
    textAlign: "center",
  },
  guestName: {
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "700",
    margin: "0 0 4px 0",
    letterSpacing: "0.5px",
  },
  guestMsg: {
    color: "#64748b",
    fontSize: "13px",
    margin: "0",
    fontStyle: "italic",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  emptyState: {
    textAlign: "center",
    marginTop: "60px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    overflow: "hidden",
    width: "1050px",
    height: "600px",
    display: "flex",
    flexDirection: "row",
    position: "relative",
    border: "1px solid #334155",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
  },
  closeModalBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    fontSize: "16px",
    cursor: "pointer",
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImageContainer: {
    width: "650px",
    height: "100%",
    backgroundColor: "#050b14",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: "20px",
    boxSizing: "border-box",
  },
  modalImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  counterBadge: {
    position: "absolute",
    bottom: "16px",
    left: "20px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
  },
  modalSidebar: {
    width: "400px",
    height: "100%",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  detailGroup: {
    marginBottom: "10px",
  },
  detailLabel: {
    color: "#94a3b8",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    display: "block",
    marginBottom: "2px",
    fontWeight: "600",
  },
  detailValue: {
    color: "#f8fafc",
    fontSize: "15px",
    margin: "0",
    fontWeight: "600",
  },
  detailMsg: {
    color: "#e2e8f0",
    fontSize: "13px",
    margin: "0",
    fontStyle: "italic",
    lineHeight: "1.3",
    backgroundColor: "#0f172a",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #334155",
    maxHeight: "60px",
    overflowY: "auto",
  },
  sideNavBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50 translateY)",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    color: "#fff",
    border: "1px solid #475569",
    borderRadius: "50%",
    width: "56px",
    height: "56px",
    fontSize: "22px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1010,
    transition: "background-color 0.2s",
  },
  mobileNavBar: {
    display: "none",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #334155",
    paddingTop: "10px",
    marginTop: "8px",
  },
  mobileNavBtn: {
    backgroundColor: "#334155",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  mobileCounter: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "600",
  },
};
