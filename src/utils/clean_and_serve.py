
#!/usr/bin/env python3
"""
File Cleaning and Web Server Script

This script performs two main functions:
1. Cleans a specified directory by removing files not in use
2. Starts a simple HTTP server with enhanced features
"""

import os
import sys
import time
import signal
import psutil
import logging
from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime
from urllib.parse import unquote
import socket
import pathlib

# =======================================================
# Configurações Globais
# =======================================================

# Diretório base para o servidor (altere para o diretório desejado)
DIRECTORY = os.path.abspath("./public")

# Extensões de arquivo permitidas
ALLOWED_EXTENSIONS = [
    '.html', '.htm', '.css', '.js', '.png', '.jpg', 
    '.jpeg', '.gif', '.svg', '.ico', '.json', '.txt'
]

# Arquivo de log
LOG_FILE = "server.log"

# =======================================================
# Configuração de Logging
# =======================================================

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

console = logging.StreamHandler()
console.setLevel(logging.INFO)
console.setFormatter(logging.Formatter('%(message)s'))
logging.getLogger('').addHandler(console)

# =======================================================
# Classe do manipulador HTTP personalizado
# =======================================================

class SecureHTTPRequestHandler(SimpleHTTPRequestHandler):
    """
    Manipulador HTTP personalizado com recursos de segurança e logging
    """
    
    def __init__(self, *args, **kwargs):
        # Definir o diretório base para o servidor
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        """Sobrescreve o método de log padrão para usar nosso logger"""
        message = format % args
        logging.info(f"{self.client_address[0]} - {message}")
    
    def do_GET(self):
        """Gerencia requisições GET com verificações de segurança"""
        # Decodifica o caminho solicitado
        self.path = unquote(self.path)
        
        # Redirecionamento para index.html se a raiz for solicitada
        if self.path == '/':
            self.path = '/index.html'
        
        # Normaliza o caminho solicitado
        requested_path = os.path.normpath(self.path.lstrip('/'))
        
        # Verifica se o arquivo tem extensão permitida
        _, ext = os.path.splitext(requested_path)
        if ext not in ALLOWED_EXTENSIONS and ext != '':
            self.send_error(403, "Extensão de arquivo não permitida")
            return
        
        # Constrói o caminho completo do arquivo
        file_path = os.path.join(DIRECTORY, requested_path)
        
        # Verificação de segurança para evitar acessos fora do diretório base
        if not os.path.abspath(file_path).startswith(os.path.abspath(DIRECTORY)):
            self.send_error(403, "Acesso negado: tentativa de acessar arquivos fora do diretório base")
            return
        
        # Verificação se o arquivo existe
        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            # Retornar página 404 personalizada
            self.send_response(404)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            # Verificar se existe um arquivo 404.html personalizado
            custom_404 = os.path.join(DIRECTORY, '404.html')
            if os.path.exists(custom_404):
                with open(custom_404, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                # Página 404 padrão
                self.wfile.write(b"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - Arquivo não encontrado</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px; 
                            background: #f5f5f5;
                        }
                        h1 { color: #444; }
                        p { color: #666; }
                    </style>
                </head>
                <body>
                    <h1>404 - Arquivo não encontrado</h1>
                    <p>O arquivo solicitado não existe neste servidor.</p>
                    <p><a href="/">Voltar para a página inicial</a></p>
                </body>
                </html>
                """)
            return
        
        # Registra o acesso ao arquivo
        logging.info(f"Arquivo acessado: {requested_path} ({ext})")
        
        # Processa a solicitação normalmente
        return SimpleHTTPRequestHandler.do_GET(self)

# =======================================================
# Função para identificar e apagar arquivos não utilizados
# =======================================================

def clean_directory(directory):
    """
    Identifica e remove arquivos não usados por outros processos no diretório especificado
    
    Args:
        directory (str): Caminho para o diretório a ser limpo
    """
    logging.info(f"Iniciando limpeza do diretório: {directory}")
    
    # Verificar se o diretório existe
    if not os.path.exists(directory):
        logging.error(f"O diretório {directory} não existe.")
        return
    
    # Obter uma lista de todos os arquivos abertos pelos processos
    open_files = set()
    for proc in psutil.process_iter(['pid', 'open_files']):
        try:
            files = proc.info.get('open_files', [])
            if files:
                for f in files:
                    if f.path:
                        open_files.add(os.path.abspath(f.path))
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    
    # Percorrer todos os arquivos no diretório
    count_removed = 0
    for root, _, files in os.walk(directory):
        for filename in files:
            file_path = os.path.abspath(os.path.join(root, filename))
            
            # Verificar se o arquivo não está em uso
            if file_path not in open_files:
                try:
                    # Verificar permissões e se realmente não está em uso
                    if os.access(file_path, os.W_OK):
                        # Em Linux/Unix, podemos testar se está em uso tentando renomear
                        temp_path = file_path + ".temp"
                        try:
                            os.rename(file_path, temp_path)
                            os.rename(temp_path, file_path)
                            
                            # Arquivo não está em uso, pode ser removido
                            os.remove(file_path)
                            logging.info(f"Arquivo removido: {file_path}")
                            count_removed += 1
                        except OSError:
                            logging.info(f"Arquivo em uso (teste de rename): {file_path}")
                except Exception as e:
                    logging.error(f"Erro ao tentar remover {file_path}: {str(e)}")
            else:
                logging.info(f"Arquivo em uso: {file_path}")
    
    logging.info(f"Limpeza concluída. {count_removed} arquivos foram removidos.")

# =======================================================
# Função para iniciar o servidor HTTP
# =======================================================

def start_server(port=8000):
    """
    Inicia o servidor HTTP na porta especificada
    
    Args:
        port (int): Porta para o servidor HTTP
    """
    server_address = ('', port)
    
    # Verificar se o diretório base existe
    if not os.path.exists(DIRECTORY):
        os.makedirs(DIRECTORY)
        logging.info(f"Diretório base criado: {DIRECTORY}")
    
    # Criar um arquivo index.html básico se não existir
    index_path = os.path.join(DIRECTORY, 'index.html')
    if not os.path.exists(index_path):
        with open(index_path, 'w') as f:
            f.write("""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Servidor Web Simples</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Servidor Web Simples</h1>
        <p>Este é um servidor web simples configurado com recursos de segurança e logging.</p>
        <p>Coloque seus arquivos no diretório <code>%s</code> para servi-los.</p>
        <p>Extensões permitidas: %s</p>
    </div>
    <footer>
        Criado com o script clean_and_serve.py
    </footer>
</body>
</html>""" % (DIRECTORY, ', '.join(ALLOWED_EXTENSIONS)))
        logging.info(f"Arquivo index.html criado em {index_path}")
    
    # Tente iniciar o servidor em portas alternativas se a principal estiver ocupada
    for attempt_port in range(port, port + 10):
        try:
            httpd = HTTPServer(('', attempt_port), SecureHTTPRequestHandler)
            port = attempt_port
            break
        except socket.error:
            logging.warning(f"Porta {attempt_port} em uso, tentando próxima...")
    else:
        logging.error("Não foi possível encontrar uma porta disponível.")
        return
    
    # Configurar manipulador de sinais para encerramento limpo
    def signal_handler(sig, frame):
        logging.info("Servidor está sendo encerrado...")
        httpd.server_close()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Determinar o endereço IP da máquina
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    
    logging.info(f"Servidor rodando em http://{ip_address}:{port}/")
    logging.info(f"Servidor também disponível em http://localhost:{port}/")
    logging.info("Pressione Ctrl+C para encerrar o servidor.")
    
    # Iniciar o servidor
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
        logging.info("Servidor encerrado.")

# =======================================================
# Função principal
# =======================================================

def main():
    """Função principal que coordena a limpeza e inicialização do servidor"""
    print("=" * 70)
    print("Utilitário de Limpeza de Arquivos e Servidor Web")
    print("=" * 70)
    print("\nEste script irá:")
    print("1. Limpar arquivos não utilizados de um diretório")
    print("2. Iniciar um servidor web simples com recursos avançados")
    print("\nATENÇÃO: A limpeza de arquivos removerá arquivos não utilizados!")
    
    # Solicitar confirmação do usuário
    try:
        response = input("\nDeseja continuar? (s/n): ").strip().lower()
        if response != 's' and response != 'sim':
            print("Operação cancelada pelo usuário.")
            sys.exit(0)
        
        # Solicitar o diretório para limpeza
        cleanup_dir = input(f"\nDigite o diretório para limpeza [padrão: {DIRECTORY}]: ").strip()
        if not cleanup_dir:
            cleanup_dir = DIRECTORY
        
        cleanup_dir = os.path.abspath(cleanup_dir)
        
        # Pedir confirmação final
        print(f"\nLimpeza será realizada em: {cleanup_dir}")
        confirm = input("Confirma? (s/n): ").strip().lower()
        if confirm != 's' and confirm != 'sim':
            print("Operação cancelada pelo usuário.")
            sys.exit(0)
        
        # Executar limpeza
        clean_directory(cleanup_dir)
        
        # Iniciar servidor
        port = input("\nDigite a porta para o servidor web [padrão: 8000]: ").strip()
        if not port:
            port = 8000
        else:
            port = int(port)
        
        start_server(port)
    
    except KeyboardInterrupt:
        print("\nOperação cancelada pelo usuário.")
    except ValueError:
        print("Erro: A porta deve ser um número inteiro.")
    except Exception as e:
        print(f"Erro inesperado: {str(e)}")

if __name__ == "__main__":
    main()
