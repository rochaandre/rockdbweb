
cd "/Users/rochaandre/Downloads/drive-download-20260217T114357Z-1-001" && \
find . -type f -exec sh -c '
  dest="/Users/rochaandre/Library/CloudStorage/GoogleDrive-andre.rocha@techmaxconsultoria.com.br/Other computers/My MacBook Pro/Dropbox/fontes/rockdb/rockdb_recover"
  for file do
    # Procura o arquivo no destino ignorando a pasta .git e node_modules
    target=$(find "$dest" -name "$(basename "$file")" -not -path "*/.*" -not -path "*/node_modules/*" | head -n 1)
    if [ -n "$target" ]; then
      echo "Sobrepondo: $target"
      cp "$file" "$target"
    else
      echo "Aviso: $(basename "$file") não encontrado no destino."
    fi
  done
' sh {} +
