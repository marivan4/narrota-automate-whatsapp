
#!/bin/bash
# Script para executar o servidor web Python

# Conferir se o Python está instalado
if ! command -v python3 &> /dev/null
then
    echo "Python 3 não está instalado. Por favor, instale-o primeiro."
    exit 1
fi

# Conferir se o módulo psutil está instalado
if ! python3 -c "import psutil" &> /dev/null
then
    echo "Instalando o módulo psutil necessário..."
    pip3 install psutil || {
        echo "Falha ao instalar psutil. Tente manualmente: pip3 install psutil"
        exit 1
    }
fi

# Tornar o script Python executável
chmod +x clean_and_serve.py

# Executar o script
echo "Iniciando o servidor web..."
python3 clean_and_serve.py
