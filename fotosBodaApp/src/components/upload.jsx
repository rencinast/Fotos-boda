import { useState } from "react";
import { supabase } from "../supabaseClient";
import fyr from "../assets/FyR.png";

function App() {
  const [files, setFiles] = useState(null);
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [uploading, setUploading] = useState(false);

  //notificacion
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const mostrarToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000); // 4 segundos
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0)
      return mostrarToast("Seleccione una foto primero");

    try {
      setUploading(true);

      //recorrer cada archivo seleccionado y subirlo a Supabase.
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        //Crear nombre unico para cada archivo.
        const fileName = `${Date.now()}_${file.name}`;
        const { error: storageError } = await supabase.storage
          .from("FOTOS")
          .upload(fileName, file);
        if (storageError) throw storageError;

        //obtener la URL pública de la foto subida.
        const { data: publicUrlData } = supabase.storage
          .from("FOTOS")
          .getPublicUrl(fileName);

        const url_imagen = publicUrlData.publicUrl;

        //Guardar registro de la foto en la base de datos.
        const { error: dbError } = await supabase.from("fotos").insert([
          {
            url_imagen,
            nombre_invitado: nombre,
            mensaje,
            aprobado: false, // valor inicial para que la foto no se publique.
          },
        ]);

        if (dbError) throw dbError;
      }

      mostrarToast( "Foto subida con exito! Gracias por compartir tu foto.", "success",);

      //Limpiar formulario después de subir la foto.
      setFiles([]);
      setNombre("");
      setMensaje("");
      e.target.reset(); // Limpiar el input de archivos
    } catch (error) {
      mostrarToast("Error al subir las fotos.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/*Notificaciones*/}
      {toast.show && (
        <div
          style={{
            ...styles.toast,
            backgroundColor: toast.type === "success" ? "#16a34a" : "#dc2626",
          }}
        >
          {toast.message}
        </div>
      )}
      <div style={styles.card}>
        <div style={styles.header}>
          {/* Aquí corregimos para usar styles.logo */}
          <img src={fyr} alt="Fátima y Rodrigo" style={styles.logo} />
          <h3 style={styles.dateTitle}>28 · 11 · 26</h3>
          <p style={styles.subtitle}>
            Comparte tus mejores momentos con nosotros
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tu Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Dedicatoria para los novios:</label>
            <textarea
              placeholder="Escribe un mensaje bonito"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.fileBox}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(e.target.files)}
                required
                style={styles.fileInput}
              />
              <span style={styles.fileText}>
                {files && files.length > 0
                  ? `${files.length} archivo(s) seleccionado(s)`
                  : "Toca aquí para elegir fotos"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{
              ...styles.button,
              opacity: uploading ? 0.7 : 1,
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? "Subiendo recuerdos..." : "Subir Fotos"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Estilos
const styles = {
  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    color: "#fff",
    padding: "14px 20px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
    fontWeight: "600",
    fontSize: "14px",
    zIndex: 9999,
    maxWidth: "90%",
    textAlign: "center",
  },
  logo: {
    width: "75px", // Ligera reducción del logo (era 90px)
    height: "auto",
    marginBottom: "6px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
  container: {
    minHeight: "100dvh", // Usa la altura dinámica visible en móviles
    backgroundColor: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 16px", // Reducimos padding vertical (de 16px a 12px)
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "20px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
    width: "100%",
    maxWidth: "440px",
    padding: "18px 20px", // Reducimos padding interno (era 24px)
    boxSizing: "border-box",
    border: "1px solid #334155",
  },
  header: {
    textAlign: "center",
    marginBottom: "14px", // Reducimos margen inferior (era 24px)
  },
  dateTitle: {
    color: "#fbbf24",
    fontSize: "25px",
    margin: "0 0 10px 0",
    fontWeight: "600",
    letterSpacing: "1px",
    fontFamily: "italic",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px", // Reducimos separación entre campos (era 18px)
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "italic",
  },
  input: {
    backgroundColor: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#94a3b8",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    backgroundColor: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "10px",
    padding: "10px 12px",
    color: "#f8fafc",
    fontSize: "16px",
    outline: "none",
    resize: "none",
    minHeight: "65px", // Reducimos la altura del textarea (era 80px)
    fontFamily: "inherit",
  },
  fileBox: {
    position: "relative",
    backgroundColor: "#0f172a",
    border: "2px dashed #475569",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  fileInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  fileText: {
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "500",
    pointerEvents: "none",
  },
  button: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
    marginTop: "8px",
  },
};
export default App;
