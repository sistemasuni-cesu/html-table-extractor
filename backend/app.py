from flask import Flask, request, jsonify
from extract import extract_tables  # Função que você já tem
import os

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nome de arquivo inválido"}), 400
    
    if file and file.filename.endswith('.html'):
        # Salva o arquivo temporariamente
        filepath = os.path.join('temp', file.filename)
        file.save(filepath)
        
        # Extrai as tabelas (usando seu código existente)
        output_dir = 'output'
        os.makedirs(output_dir, exist_ok=True)
        extract_tables(filepath, output_dir)
        
        # Lê os resultados (exemplo)
        results = []
        for filename in os.listdir(output_dir):
            with open(os.path.join(output_dir, filename), 'r') as f:
                results.append(f.read())
        
        return jsonify({"tables": results}), 200
    
    return jsonify({"error": "Formato inválido (use .html)"}), 400

if __name__ == '__main__':
    os.makedirs('temp', exist_ok=True)
    app.run(debug=True, port=5000)
