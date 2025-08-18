from flask import Flask, request, jsonify
from flask_cors import CORS
from extract import extract_tables
import os
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Habilita CORS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nome de arquivo inválido"}), 400
    
    if file and file.filename.endswith('.html'):
        try:
            # Gera um nome único para o arquivo
            unique_id = str(uuid.uuid4())
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{timestamp}_{unique_id}.html"
            filepath = os.path.join('temp', filename)
            file.save(filepath)
            
            output_dir = 'output'
            os.makedirs(output_dir, exist_ok=True)
            
            # Processa o arquivo
            extract_tables(filepath, output_dir)
            
            # Lê os resultados
            results = []
            for output_file in os.listdir(output_dir):
                with open(os.path.join(output_dir, output_file), 'r') as f:
                    results.append(f.read())
            
            # Limpa os arquivos temporários
            os.remove(filepath)
            for output_file in os.listdir(output_dir):
                os.remove(os.path.join(output_dir, output_file))
            
            return jsonify({"tables": results}), 200
        
        except Exception as e:
            return jsonify({"error": f"Erro ao processar arquivo: {str(e)}"}), 500
    
    return jsonify({"error": "Formato inválido (use .html)"}), 400

if __name__ == '__main__':
    os.makedirs('temp', exist_ok=True)
    os.makedirs('output', exist_ok=True)
    app.run(host='0.0.0.0', port=10000)  # Configuração para o Render
