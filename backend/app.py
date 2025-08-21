from flask import Flask, request, render_template, jsonify
from bs4 import BeautifulSoup
import pandas as pd
import os   # ✅ agora está importado corretamente

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")  # sua página inicial

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return "Nenhum arquivo enviado", 400
    
    file = request.files['file']
    html_content = file.read().decode("utf-8")

    soup = BeautifulSoup(html_content, "html.parser")
    tables = soup.find_all("table")

    if not tables:
        return jsonify({"message": "Nenhuma tabela encontrada."})

    all_tables = []
    for i, table in enumerate(tables, start=1):
        df = pd.read_html(str(table))[0]  # converte a tabela em DataFrame
        all_tables.append(df.to_dict(orient="records"))  # lista de dicionários

    return jsonify(all_tables)

# 🚀 Configuração para rodar no Render
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render define a porta
    app.run(host="0.0.0.0", port=port)
