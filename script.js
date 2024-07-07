async function main() {
    let pyodide = await loadPyodide();

    // Python code to convert size and adjust PNG size
    const pythonCode = `
import base64

def convert_size_to_bytes(num_str, unit):
    num = int(num_str)
    if unit == 'bytes':
        return num
    elif unit == 'kilobytes':
        return num * 1024
    elif unit == 'megabytes':
        return num * 1024 * 1024
    elif unit == 'gigabytes':
        return num * 1024 * 1024 * 1024
    else:
        raise ValueError("Unidad de tamaño no reconocida.")

def set_png_size(data, num_str, unit):
    try:
        target_size = convert_size_to_bytes(num_str, unit)
    except ValueError as e:
        return f"Error al convertir el tamaño: {str(e)}"
    
    current_size = len(data)
    if target_size < current_size:
        new_data = data[:target_size]
    else:
        extra_bytes = target_size - current_size
        extra_data = b'\\0' * extra_bytes
        new_data = data + extra_data

    return base64.b64encode(new_data).decode('utf-8')
    `;

    await pyodide.runPythonAsync(pythonCode);

    document.getElementById('processButton').addEventListener('click', async () => {
        const inputFile = document.getElementById('inputFile').files[0];
        const size = document.getElementById('size').value;
        const unit = document.getElementById('unit').value;
        const outputElement = document.getElementById('output');
        const downloadLink = document.getElementById('downloadLink');

        if (!inputFile || !size || !unit) {
            outputElement.innerText = "Please provide all inputs.";
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
            const fileData = new Uint8Array(event.target.result);
            const base64Data = btoa(String.fromCharCode.apply(null, fileData));
            
            let result;
            try {
                result = await pyodide.runPythonAsync(`
data = base64.b64decode("${base64Data}")
output = set_png_size(data, "${size}", "${unit}")
output
                `);
                const processedData = atob(result);
                const byteArray = new Uint8Array(processedData.length);
                for (let i = 0; i < processedData.length; i++) {
                    byteArray[i] = processedData.charCodeAt(i);
                }

                const blob = new Blob([byteArray], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = 'processed_image.png';
                downloadLink.style.display = 'block';
                downloadLink.innerText = 'Download Processed File';

                outputElement.innerText = 'Processing complete.';
            } catch (error) {
                outputElement.innerText = `Error: ${error.message}`;
            }
        };
        fileReader.readAsArrayBuffer(inputFile);
    });
}

// Initialize the Pyodide runtime
main();
