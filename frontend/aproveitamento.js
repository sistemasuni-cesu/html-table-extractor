// aproveitamento.js - Versão Integrada com Python
document.addEventListener('DOMContentLoaded', function() {
    const { jsPDF } = window.jspdf;
    
    // Elementos do DOM
    const processButton = document.getElementById("processButton");
    const organizedResults = document.getElementById('organizedResults');
    const pendingResults = document.getElementById('pendingResults');
    const finalResultsContent = document.getElementById('finalResultsContent');
    const resultsSection = document.getElementById('resultsSection');
    const finalResults = document.getElementById('finalResults');
    const downloadButton = document.getElementById('downloadButton');
    const finalDownloadButton = document.getElementById('finalDownloadButton');
    const finalizeButton = document.getElementById('finalizeButton');
    
    // Variáveis globais
    let currentYear = new Date().getFullYear();
    let currentSemester = new Date().getMonth() < 6 ? 1 : 2;
    let disciplines = [];
    let pendingDisciplines = [];
    
    // Configuração das abas
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });

    //Evento para analisar o html
    if (processButton && fileInput) {
        processButton.addEventListener("click", () => {
            const file = fileInput.files[0];
            if (!file) {
                alert("Por favor, selecione um arquivo antes de processar!");
                return;
            }

    // Evento para finalizar ajustes
    finalizeButton.addEventListener('click', finalizeAdjustments);
    
    // Evento para baixar PDF da grade organizada
    downloadButton.addEventListener('click', () => generatePDF('organized'));
    
    // Evento para baixar PDF final
    finalDownloadButton.addEventListener('click', () => generatePDF('final'));
    
    // Função para chamar dados do Python (Render)
    const formData = new FormData();
    formData.append("file", new Blob([JSON.stringify({ dados: "exemplo" })], { type: "application/json" }));

    fetch("https://html-table-extractor-3.onrender.com/upload", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Dados recebidos:", data);
        receivePythonData(data);
    })
    .catch(error => {
        console.error("Falha na requisição:", error);
        // Mostra resultado na tela
                resultadoDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;

                // Se quiser tratar de forma personalizada:
                receivePythonData(data);
            })
            .catch(error => {
                console.error("Falha na requisição:", error);
                resultadoDiv.innerHTML = `<p style="color:red;">Erro: ${error.message}</p>`;
    });

    // Função para processar dados vindos do Python
    function receivePythonData(pythonData) {
        if (!Array.isArray(pythonData)) {
            console.error("Dados recebidos não são um array:", pythonData);
            return;
        }

        disciplines = pythonData.map(item => ({
            code: item.codigo || '',
            name: item.disciplina || item.nome || '',
            hours: item.carga_horaria || item.horas || '',
            series: parseInt(item.serie) || 0,
            dispense: item.dispensar || 'Não',
            adaptation: item.adaptacao || 'Não',
            enrollNow: item.matricular_agora || 'Não',
            year: item.ano || '',
            semester: item.semestre || '',
            equivalent: item.equivalente || ''
        }));

        console.log("Disciplinas processadas:", disciplines);
        organizeDisciplines();
        resultsSection.style.display = 'block';
        finalResults.style.display = 'none';
    }

    // Organizar disciplinas
    function organizeDisciplines() {
        organizedResults.innerHTML = '';
        pendingResults.innerHTML = '';
        pendingDisciplines = [];

        disciplines.forEach(discipline => {
            let status = '';
            if (discipline.dispense === 'Sim') {
                status = 'Dispensada';
            } else if (discipline.adaptation === 'Sim') {
                status = 'Adaptação';
            } else if (discipline.enrollNow === 'Sim') {
                status = 'Matricular Agora';
                discipline.year = currentYear;
                discipline.semester = currentSemester;
            } else {
                status = 'Pendente';
                pendingDisciplines.push(discipline);
                return;
            }

            const div = document.createElement('div');
            div.className = 'discipline';
            div.innerHTML = `
                <strong>${discipline.name}</strong> (${discipline.code}) - 
                ${discipline.hours}h - Série ${discipline.series} 
                <span class="status">[${status}]</span>
            `;
            organizedResults.appendChild(div);
        });

        pendingDisciplines.forEach(discipline => {
            const div = document.createElement('div');
            div.className = 'discipline pending';
            div.innerHTML = `
                <strong>${discipline.name}</strong> (${discipline.code}) - 
                ${discipline.hours}h - Série ${discipline.series} 
                <button class="btn btn-small btn-success">Matricular</button>
            `;
            const enrollButton = div.querySelector('button');
            enrollButton.addEventListener('click', () => {
                discipline.enrollNow = 'Sim';
                discipline.year = currentYear;
                discipline.semester = currentSemester;
                organizeDisciplines();
            });
            pendingResults.appendChild(div);
        });
    }

    // Finalizar ajustes
    function finalizeAdjustments() {
        generateFinalResults();
        resultsSection.style.display = 'none';
        finalResults.style.display = 'block';
    }

    // Gerar resultados finais
    function generateFinalResults() {
        finalResultsContent.innerHTML = '';

        const grouped = {};
        disciplines.forEach(discipline => {
            if (!discipline.year || !discipline.semester) return;
            const key = `${discipline.year}.${discipline.semester}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(discipline);
        });

        Object.keys(grouped).sort().forEach(key => {
            const [year, semester] = key.split('.');
            const section = document.createElement('div');
            section.className = 'semester-group';
            section.innerHTML = `<h4>${year}.${semester}</h4>`;
            
            grouped[key].forEach(discipline => {
                const div = document.createElement('div');
                div.className = 'discipline';
                div.innerHTML = `
                    <strong>${discipline.name}</strong> (${discipline.code}) - 
                    ${discipline.hours}h - Série ${discipline.series}
                `;
                section.appendChild(div);
            });

            finalResultsContent.appendChild(section);
        });
    }

    // Gerar PDF
    function generatePDF(type) {
        const doc = new jsPDF();
        doc.setFontSize(12);
        
        if (type === 'organized') {
            doc.text("Grade Organizada", 14, 20);
            let y = 30;
            disciplines.forEach(discipline => {
                if (discipline.dispense === 'Não' && discipline.adaptation === 'Não' && discipline.enrollNow === 'Não') return;
                doc.text(`${discipline.name} (${discipline.code}) - ${discipline.hours}h - Série ${discipline.series}`, 14, y);
                y += 10;
                if (y > 270) { doc.addPage(); y = 20; }
            });
        } else {
            doc.text("Grade Final", 14, 20);
            let y = 30;
            const grouped = {};
            disciplines.forEach(discipline => {
                if (!discipline.year || !discipline.semester) return;
                const key = `${discipline.year}.${discipline.semester}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(discipline);
            });
            
            Object.keys(grouped).sort().forEach(key => {
                doc.text(`Semestre ${key}`, 14, y);
                y += 10;
                grouped[key].forEach(discipline => {
                    doc.text(`${discipline.name} (${discipline.code}) - ${discipline.hours}h - Série ${discipline.series}`, 20, y);
                    y += 10;
                    if (y > 270) { doc.addPage(); y = 20; }
                });
            });
        }
        
        doc.save(`${type}_results.pdf`);
    }
});
