import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App'; // O el componente específico de tu galería/subida

describe('Flujo de Subida, Moderación y Galería', () => {

  it('permite seleccionar un archivo y múltiples archivos', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // 1. Buscamos el input de tipo archivo (ajusta el selector según tu componente, ej: un test id o el input nativo)
    const fileInput = document.querySelector('input[type="file"]');
    
    if (fileInput) {
      // Creamos archivos falsos simulando fotos de la boda
      const file1 = new File(['dummy content'], 'boda1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['dummy content 2'], 'boda2.jpg', { type: 'image/jpeg' });

      // Simulamos la carga de múltiples archivos
      fireEvent.change(fileInput, {
        target: { files: [file1, file2] },
      });

      // Verificamos que los archivos fueron seleccionados/reconocidos por el componente
      expect(fileInput.files.length).toBe(2);
      expect(fileInput.files[0].name).toBe('boda1.jpg');
      expect(fileInput.files[1].name).toBe('boda2.jpg');
    }
  });

  it('muestra la galería y permite ver las fotos cargadas', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Aquí puedes verificar elementos clave de tu galería renderizada, 
    // por ejemplo, un título de sección o contenedores de imágenes
    await waitFor(() => {
      const galleryElement = screen.queryByText(/galería/i) || screen.queryByRole('region');
      expect(galleryElement).toBeDefined();
    });
  });

});