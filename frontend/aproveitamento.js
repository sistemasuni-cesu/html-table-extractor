document.getElementById('extractButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('pdfUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Selecione um arquivo HTML!');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert(`Erro: ${data.error}`);
        } else {
            // Exibe os resultados na interface
            const preview = document.getElementById('dataPreview');
            preview.value = data.tables.join('\n\n---\n\n');
            
            // Atualiza a aba de resultados (exemplo)
            document.getElementById('organizedResults').innerHTML = 
                data.tables.map(table => `<div class="table-result">${table}</div>`).join('');
        }
    } catch (error) {
        console.error('Falha ao enviar arquivo:', error);
    }
});
