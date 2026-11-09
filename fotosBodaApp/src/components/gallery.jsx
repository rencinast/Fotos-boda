import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Gallery() {
  const [fotosAprobadas, setFotosAprobadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const cargarGaleria = async () => {
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
    };

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
      <div style={styles.header}>
        <h1 style={styles.title}>Álbum de Recuerdos 💍</h1>
        <p style={styles.subtitle}>
          Momentos inolvidables capturados por nuestros invitados
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#cbd5e1", marginTop: "40px", fontSize: "16px" }}>
          Abriendo el álbum...
        </p>
      ) : fotosAprobadas.length === 0 ? (
        <div style={styles.emptyState}></div>
      ) : (
        <div style={styles.grid}>
          {fotosAprobadas.map((foto, index) => (
            <div
              key={foto.id}
              style={styles.polaroidCard}
              onClick={() => setSelectedIndex(index)}
            >
              {/* Marco fotográfico interior (estilo ventana Polaroid) */}
              <div style={styles.polaroidImageWrapper}>
                <img
                  src={foto.url_imagen}
                  alt="Recuerdo de boda"
                  style={styles.polaroidImage}
                />
              </div>
              {/* Pie de la Polaroid */}
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
        <div style={styles.modalOverlay} onClick={() => setSelectedIndex(null)}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            style={{ ...styles.sideNavBtn, left: "20px" }}
            title="Anterior (Flecha Izquierda)"
          >
            ❮
          </button>

          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.closeModalBtn}
              onClick={() => setSelectedIndex(null)}
            >
              ✕
            </button>

            <div style={styles.modalImageContainer}>
              <img
                src={fotoActual.url_imagen}
                alt="Vista ampliada"
                style={styles.modalImage}
              />
              <div style={styles.counterBadge}>
                {selectedIndex + 1} / {fotosAprobadas.length}
              </div>
            </div>

            <div style={styles.modalSidebar}>
              <div>
                <h2
                  style={{ color: "#f8fafc", marginTop: "0", fontSize: "22px" }}
                >
                  Recuerdo Especial 🤍
                </h2>

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
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            style={{ ...styles.sideNavBtn, right: "20px" }}
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
  galleryContainer: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#0f172a",
    padding: "40px 20px 80px 20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
  backLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "30px",
    width: "100%",
    maxWidth: "1100px",
  },
  // Estructura idéntica a una Polaroid física
  polaroidCard: {
    backgroundColor: "#ffffff", // Marco blanco completo
    padding: "14px 14px 24px 14px", // Márgenes simétricos arriba/lados y más espacio abajo
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
    backgroundColor: "#000000", // Fondo negro/oscuro dentro del marco como en una Polaroid real
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  polaroidImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain", // Muestra la foto completa sin recortar nada
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
    fontFamily: "Caveat, cursive, sans-serif", // Simula escritura a mano si se desea, o limpia
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
  },
  detailGroup: {
    marginBottom: "20px",
  },
  detailLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
  },
  detailValue: {
    color: "#f8fafc",
    fontSize: "17px",
    margin: "0",
    fontWeight: "600",
  },
  detailMsg: {
    color: "#e2e8f0",
    fontSize: "15px",
    margin: "0",
    fontStyle: "italic",
    lineHeight: "1.5",
    backgroundColor: "#0f172a",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #334155",
    maxHeight: "180px",
    overflowY: "auto",
  },
  modalFooterInfo: {
    textAlign: "center",
    borderTop: "1px solid #334155",
    paddingTop: "15px",
  },
  sideNavBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
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
};
