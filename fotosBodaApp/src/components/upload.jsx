import { useState } from "react";
import { supabase } from "../supabaseClient";
import fyr from "../assets/FyR.png";

function App() {
  const [files, setFiles] = useState(null);
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

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
    
    const fileArray = Array.from(files);
    const maxSize = 50 * 1024 * 1024; //convertir 50MB en bytes

    //Validacion de tamaño de la foto max 50MB

    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        return mostrarToast(`El archivo "${file.name}" No es Una imagen valida,`, "error");
      }
      if (file.size > maxSize) {
        return mostrarToast(`El archivo "${file.name}" supera el limite de 50MB,`, "error")
      }
    }

    const uploadFileNames = [];

    try {
      setUploading(true);
      // inicializar contador
      setProgress ({ current: 0, total: fileArray.length });

      let completeCount = 0;
      //Procesar todas las subidas
      const uploadPromises = fileArray.map(async (file) =>{

        //Crear nombre unico para cada archivo.
        const fileExt = file.name.split('.').pop();
        const uniqueId = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const fileName = `${uniqueId}.${fileExt}`;

        const { error: storageError } = await supabase.storage
          .from("FOTOS")
          .upload(fileName, file);
        if (storageError) throw storageError;

        //Si se suben los archivos se agergan al arreglo
        uploadFileNames.push(fileName);

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

        //Actualizar el contador
        completeCount ++;
        setProgress({ current: completeCount, total: fileArray.length })
      });

      //Esperara a que todas las imagenes se suban
      await Promise.all(uploadPromises);

      mostrarToast( "Foto subida con exito! Gracias por compartir tu foto.", "success",);

      //Limpiar formulario después de subir la foto.
      setFiles([]);
      setNombre("");
      setMensaje("");
      e.target.reset(); // Limpiar el input de archivos
    } catch (error) {

      // TRANSACCIONALIDAD / ROLLBACK: 
      // Si algo falló a mitad del lote, eliminamos del Storage los archivos que ya se habían subido
      if (uploadFileNames.length > 0) {
        await supabase.storage.from("FOTOS").remove(uploadFileNames);
      }
      mostrarToast("Error al subir las fotos." + (error.mensaje || "Error desconocido"), "error");
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
              cursor: uploading ? "not-allowed" : "pointer",
              position: "relative",
              overflow: "hidden", // Importante para contener el relleno interno
            }}
          >
            {/* Fondo que se llena dinámicamente cuando está subiendo */}
            {uploading && (
              <div
                style={{
                  ...styles.buttonProgressFill,
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            )}

            {/* Texto que cambia dinámicamente */}
            <span style={styles.buttonTextContent}>
              {uploading
                ? `Subiendo... (${progress.current}/${progress.total})`
                : "Subir Fotos"}
            </span>
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
    transition: "transform 0.1s",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
    marginTop: "8px",
    position: "relative", // Requerido para posicionar el llenado interno
    overflow: "hidden",   // Oculta los bordes del relleno cuando supera el 100%
  },
  buttonProgressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "#1d4ed8", // Un tono azul un poco más oscuro o vibrante para el progreso
    transition: "width 0.2s ease-in-out",
    zIndex: 1,
  },
  buttonTextContent: {
    position: "relative",
    zIndex: 2, // Asegura que el texto y el contador siempre estén por encima de la barra de carga
  },
};
export default App;
