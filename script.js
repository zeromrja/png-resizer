async function main() {
    // Load Pyodide
    let pyodide = await loadPyodide();

    // Define the fixed Python code
    const pythonCode = `
import tkinter as tk
from tkinter import filedialog, simpledialog, messagebox, ttk

def convert_size_to_bytes(num_str, unit):
    """Convierte un número con una unidad de tamaño a bytes."""
    num = int(num_str)
    if unit == 'bytes':
        return num
    elif unit == 'kilobytes':
        return num * 1000
    elif unit == 'megabytes':
        return num * 1000 * 1000
    elif unit == 'gigabytes':
        return num * 1000 * 1000 * 1000
    else:
        raise ValueError("Unidad de tamaño no reconocida.")

def set_png_size(input_filename, output_filename, num_str, unit):
    try:
        target_size = convert_size_to_bytes(num_str, unit)
    except ValueError as e:
        raise ValueError(f"Error al convertir el tamaño: {str(e)}")

    # Leer la imagen original
    with open(input_filename, 'rb') as original_file:
        data = original_file.read()

    # Calcular el tamaño actual y ajustar el tamaño según el objetivo
    current_size = len(data)
    
    if target_size < current_size:
        # Truncar el archivo si es más grande que el tamaño objetivo
        new_data = data[:target_size]
    else:
        # Rellenar el archivo si es más pequeño que el tamaño objetivo
        extra_bytes = target_size - current_size
        extra_data = b'\0' * extra_bytes
        new_data = data + extra_data

    # Escribir la nueva imagen con el tamaño ajustado
    with open(output_filename, 'wb') as new_file:
        new_file.write(new_data)

def select_file_and_set_size():
    input_filename = filedialog.askopenfilename(title="Selecciona una imagen PNG", filetypes=[("PNG files", "*.png")])
    if not input_filename:
        return  # No se seleccionó ningún archivo

    # Solicitar el número
    num_str = simpledialog.askstring("Número", "Introduce el número de tamaño objetivo:")
    if not num_str:
        return  # No se introdujo un número

    # Crear una ventana secundaria para seleccionar la unidad
    unit_window = tk.Toplevel(root)
    unit_window.title("Seleccionar unidad")
    
    tk.Label(unit_window, text="Selecciona la unidad de tamaño:").pack(pady=10)

    unit_var = tk.StringVar(value="bytes")
    unit_options = ['bytes', 'kilobytes', 'megabytes', 'gigabytes']
    unit_dropdown = ttk.Combobox(unit_window, textvariable=unit_var, values=unit_options)
    unit_dropdown.pack(pady=10)

    def confirm_selection():
        unit = unit_var.get()
        if unit not in unit_options:
            messagebox.showerror("Error", "Unidad de tamaño no válida.")
            return

        unit_window.destroy()

        output_filename = filedialog.asksaveasfilename(title="Guardar imagen ajustada", defaultextension=".png", filetypes=[("PNG files", "*.png")])
        if not output_filename:
            return  # No se especificó un nombre de archivo de salida

        try:
            set_png_size(input_filename, output_filename, num_str, unit)
            messagebox.showinfo("Éxito", f"Archivo guardado como {output_filename}")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    tk.Button(unit_window, text="Confirmar", command=confirm_selection).pack(pady=10)
    unit_window.grab_set()  # Hacer que esta ventana sea modal

# Configuración de la ventana principal
root = tk.Tk()
root.title("Ajustar Tamaño de Imagen PNG")
root.geometry("400x200")

# Botón para seleccionar el archivo y ajustar el tamaño
button = tk.Button(root, text="Seleccionar archivo PNG", command=select_file_and_set_size)
button.pack(expand=True)

# Ejecutar la aplicación
root.mainloop()
`;

    // Function to run Python code
    document.getElementById('runPythonButton').addEventListener('click', async () => {
        try {
            let output = await pyodide.runPythonAsync(pythonCode);
            document.getElementById('pythonOutput').innerText = output;
        } catch (error) {
            document.getElementById('pythonOutput').innerText = error;
        }
    });
}

// Initialize the Pyodide runtime
main();
