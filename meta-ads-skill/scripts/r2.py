#!/usr/bin/env python3
"""
Meta Ads Paperbloom - Upload de criativos para Cloudflare R2
Armazena imagens e videos em meta-ads/criativos/<produto>/ e retorna URL publica.

Uso:
  r2.py upload --file criativo.jpg --produto 12-cartas
  r2.py list [--produto mensagem-digital]
  r2.py delete --key meta-ads/criativos/geral/arquivo.jpg
"""
import os
import sys
import json
import argparse
import mimetypes
from pathlib import Path
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import _load_env_file, print_json, print_error

PRODUTOS_VALIDOS = ['mensagem-digital', '12-cartas', 'revelacao-virtual', 'geral']


# ---------------------------------------------------------------------------
# Cliente R2
# ---------------------------------------------------------------------------

def get_r2_client():
    """Inicializa cliente S3-compativel com Cloudflare R2."""
    try:
        import boto3
    except ImportError:
        print_error("boto3 nao instalado. Instale com: pip3 install boto3")
        sys.exit(1)

    _load_env_file()

    required = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_ENDPOINT', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL']
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        print_error(f"Variaveis R2 nao encontradas no .env: {', '.join(missing)}")
        print("  Adicione ao ~/.claude/skills/meta-ads-paperbloom/.env:", file=sys.stderr)
        for k in missing:
            print(f"  {k}=\"...\"  # copiar do .env.local do projeto Paperbloom", file=sys.stderr)
        sys.exit(1)

    import boto3
    client = boto3.client(
        's3',
        endpoint_url=os.environ['R2_ENDPOINT'],
        aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
        region_name='auto',
    )
    return client


def get_public_url_base():
    return os.environ.get('R2_PUBLIC_URL', '').rstrip('/')


def get_bucket():
    return os.environ['R2_BUCKET_NAME']


# ---------------------------------------------------------------------------
# Subcommands
# ---------------------------------------------------------------------------

def cmd_upload(args):
    """Faz upload de arquivo local para R2 e retorna URL publica."""
    file_path = Path(args.file)
    if not file_path.exists():
        print_error(f"Arquivo nao encontrado: {args.file}")
        sys.exit(1)

    if not file_path.is_file():
        print_error(f"Caminho nao e um arquivo: {args.file}")
        sys.exit(1)

    # Detectar content type
    mime_type, _ = mimetypes.guess_type(str(file_path))
    if not mime_type:
        # Fallback por extensao
        ext = file_path.suffix.lower()
        mime_map = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
                    '.webp': 'image/webp', '.mp4': 'video/mp4', '.mov': 'video/quicktime'}
        mime_type = mime_map.get(ext, 'application/octet-stream')

    # Construir key com estrutura de pasta
    produto = args.produto or 'geral'
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_name = file_path.stem.replace(' ', '_') + file_path.suffix.lower()
    key = f"meta-ads/criativos/{produto}/{timestamp}_{safe_name}"

    client = get_r2_client()
    bucket = get_bucket()
    public_url_base = get_public_url_base()

    file_size_mb = file_path.stat().st_size / (1024 * 1024)
    print(f"Upload: {file_path.name} ({file_size_mb:.1f}MB) → r2://{bucket}/{key}", file=sys.stderr)

    with open(file_path, 'rb') as f:
        client.put_object(
            Bucket=bucket,
            Key=key,
            Body=f,
            ContentType=mime_type,
            CacheControl='public, max-age=31536000',
        )

    public_url = f"{public_url_base}/{key}"
    print(f"OK: {public_url}", file=sys.stderr)

    print_json({
        'url': public_url,
        'key': key,
        'file': str(file_path.name),
        'mime_type': mime_type,
        'size_mb': round(file_size_mb, 2),
    })


def cmd_list(args):
    """Lista criativos no R2 com URLs publicas."""
    _load_env_file()
    client = get_r2_client()
    bucket = get_bucket()
    public_url_base = get_public_url_base()

    prefix = 'meta-ads/criativos/'
    if args.produto:
        prefix += f"{args.produto}/"

    response = client.list_objects_v2(Bucket=bucket, Prefix=prefix)

    objects = []
    for obj in response.get('Contents', []):
        key = obj['Key']
        # Extrair produto do path
        parts = key.split('/')
        produto_dir = parts[2] if len(parts) > 2 else 'geral'
        objects.append({
            'key': key,
            'url': f"{public_url_base}/{key}",
            'produto': produto_dir,
            'file': parts[-1] if parts else key,
            'size_kb': round(obj['Size'] / 1024, 1),
            'last_modified': obj['LastModified'].strftime('%Y-%m-%d %H:%M'),
        })

    # Ordenar por data (mais recente primeiro)
    objects.sort(key=lambda x: x['last_modified'], reverse=True)

    if not objects:
        print(f"Nenhum criativo encontrado em: {prefix}", file=sys.stderr)

    print_json({'objects': objects, 'count': len(objects), 'prefix': prefix})


def cmd_delete(args):
    """Remove arquivo do R2."""
    _load_env_file()
    client = get_r2_client()
    bucket = get_bucket()

    print(f"Removendo: {args.key}", file=sys.stderr)
    client.delete_object(Bucket=bucket, Key=args.key)
    print(f"OK: {args.key} removido", file=sys.stderr)
    print_json({'deleted': args.key})


# ---------------------------------------------------------------------------
# Funcao publica para uso por outros scripts (create.py, etc.)
# ---------------------------------------------------------------------------

def upload_file(file_path: str, produto: str = 'geral') -> str:
    """
    Upload de arquivo local para R2. Retorna a URL publica.
    Usada internamente por create.py image --file.
    """
    _load_env_file()

    try:
        import boto3
    except ImportError:
        print_error("boto3 nao instalado. Instale com: pip3 install boto3")
        sys.exit(1)

    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Arquivo nao encontrado: {file_path}")

    mime_type, _ = mimetypes.guess_type(str(path))
    if not mime_type:
        ext = path.suffix.lower()
        mime_map = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
                    '.webp': 'image/webp', '.mp4': 'video/mp4', '.mov': 'video/quicktime'}
        mime_type = mime_map.get(ext, 'application/octet-stream')

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_name = path.stem.replace(' ', '_') + path.suffix.lower()
    key = f"meta-ads/criativos/{produto}/{timestamp}_{safe_name}"

    required = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_ENDPOINT', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL']
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        raise EnvironmentError(f"Variaveis R2 nao configuradas no .env: {', '.join(missing)}")

    import boto3
    client = boto3.client(
        's3',
        endpoint_url=os.environ['R2_ENDPOINT'],
        aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
        region_name='auto',
    )

    with open(path, 'rb') as f:
        client.put_object(
            Bucket=os.environ['R2_BUCKET_NAME'],
            Key=key,
            Body=f,
            ContentType=mime_type,
            CacheControl='public, max-age=31536000',
        )

    public_url = f"{os.environ['R2_PUBLIC_URL'].rstrip('/')}/{key}"
    print(f"R2 upload OK: {public_url}", file=sys.stderr)
    return public_url


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Cloudflare R2 — Criativos Meta Ads Paperbloom",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Produtos validos: {', '.join(PRODUTOS_VALIDOS)}

Exemplos:
  r2.py upload --file banner.jpg --produto 12-cartas
  r2.py upload --file video.mp4 --produto mensagem-digital
  r2.py list
  r2.py list --produto revelacao-virtual
  r2.py delete --key meta-ads/criativos/geral/20240101_banner.jpg
        """,
    )
    sub = parser.add_subparsers(dest='command', required=True)

    # upload
    p = sub.add_parser('upload', help='Upload de arquivo local para R2')
    p.add_argument('--file', required=True, help='Caminho do arquivo local (imagem ou video)')
    p.add_argument('--produto', choices=PRODUTOS_VALIDOS, default='geral',
                   help='Produto para organizar no bucket (default: geral)')

    # list
    p = sub.add_parser('list', help='Listar criativos no R2')
    p.add_argument('--produto', choices=PRODUTOS_VALIDOS, help='Filtrar por produto')

    # delete
    p = sub.add_parser('delete', help='Remover arquivo do R2')
    p.add_argument('--key', required=True,
                   help='Key do arquivo (ex: meta-ads/criativos/geral/arquivo.jpg)')

    args = parser.parse_args()
    commands = {'upload': cmd_upload, 'list': cmd_list, 'delete': cmd_delete}
    commands[args.command](args)


if __name__ == '__main__':
    main()
