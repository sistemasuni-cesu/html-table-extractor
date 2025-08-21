from flask import Flask, request, render_template, jsonify
from bs4 import BeautifulSoup
import pandas as pd
import os
from flask_cors import CORS   # importa antes

app = Flask(__name__)
CORS(app)  # habilita CORS

@app.route('/')
def index():
    return render_template("index.html")

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
    for table in tables:
        df = pd.read_html(str(table))[0]
        all_tables.append(df.to_dict(orient="records"))

    return jsonify(all_tables)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
