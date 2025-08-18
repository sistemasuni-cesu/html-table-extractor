from bs4 import BeautifulSoup
import os

def extract_tables(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as file:
        html_content = file.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    tables = soup.find_all('sy-one-embedded-reference-table-field')

    for i, table in enumerate(tables, start=1):
        output_file = os.path.join(output_path, f'tabela_extraida_{i}.html')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(str(table))
        print(f"✅ Tabela {i} salva em {output_file}")

if __name__ == "__main__":
    input_file = os.path.join('input', '2.html')  # Altere para o nome do seu arquivo
    output_dir = 'output'
    os.makedirs(output_dir, exist_ok=True)
    extract_tables(input_file, output_dir)
