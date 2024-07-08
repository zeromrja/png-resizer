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
        raise ValueError("Unrecognized size unit.")

def set_png_size(base64_data, num_str, unit):
    try:
        data = base64.b64decode(base64_data)
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

    const progress = document.getElementById('progress');
    const status = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    document.getElementById('processButton').addEventListener('click', async () => {
        const inputFile = document.getElementById('inputFile').files[0];
        const size = document.getElementById('size').value;
        const unit = document.getElementById('unit').value;

        if (!inputFile || !size || !unit) {
            status.innerText = "Please provide all inputs.";
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
            const fileData = event.target.result;
            const base64Data = arrayBufferToBase64(fileData);

            try {
                progress.style.display = 'block';
                progress.value = 0;
                status.innerText = 'Processing...';

                const result = await pyodide.runPythonAsync(`
output = set_png_size("${base64Data}", "${size}", "${unit}")
output
                `);

                const processedData = base64ToUint8Array(result);
                const blob = new Blob([processedData], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = 'processed_image.png';
                downloadLink.style.display = 'block';
                downloadLink.innerText = 'Download Processed File';

                progress.style.display = 'none';
                status.innerText = 'Processing complete.';
            } catch (error) {
                status.innerText = `Error: ${error.message}`;
                progress.style.display = 'none';
            }
        };

        fileReader.readAsArrayBuffer(inputFile);
    });
}

// Initialize the Pyodide runtime
main();