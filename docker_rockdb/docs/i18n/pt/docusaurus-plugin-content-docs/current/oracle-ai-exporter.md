# Instalação do Oracle AI Database Metrics Exporter (Binário Standalone)

Este guia apresenta um passo a passo simplificado para instalar e configurar o **AI Database Metrics Exporter** (baseado em OpenTelemetry) no modo standalone.

## Pré-requisitos

O ambiente utilizado para esta configuração foi:
- **SO:** Oracle Linux Server 8.10 (Kernel 5.15)
- **Banco de Dados:** Oracle Database 19c (Enterprise Edition)

### Preparação do Servidor

Inicie instalando as ferramentas essenciais e configurando o hostname:

```bash
# Atualização e instalação de dependências
dnf install wget zip unzip rsync net-tools mlocate -y
updatedb

# Configuração do hostname
hostnamectl set-hostname srvexporter.local
# (Opcional) Reinicie para aplicar as mudanças: init 6
```

Atualize o arquivo `/etc/hosts` com o IP do seu servidor:
```text
192.168.68.102 srvexporter.local srvexporter
```

### Rede e Segurança

Abra as portas necessárias no firewall:
- **9161:** Endpoint de métricas do Exporter
- **3000:** Grafana (se aplicável)
- **9090:** Prometheus (se aplicável)

```bash
firewall-cmd --zone=public --add-port=9161/tcp --permanent
firewall-cmd --zone=public --add-port=3000/tcp --permanent
firewall-cmd --zone=public --add-port=9090/tcp --permanent
firewall-cmd --reload
```

Desabilite o SELinux (comando `setenforce 0` e altere `SELINUX=disabled` em `/etc/selinux/config`).

## Configuração do Banco de Dados

Crie um usuário de monitoramento dedicado na sua instância ou PDB:

```sql
CREATE USER USR_EXPORTER IDENTIFIED BY "SUA_SENHA";
GRANT CREATE SESSION, RESOURCE TO USR_EXPORTER;
GRANT SELECT ANY DICTIONARY TO USR_EXPORTER;
```

## Instalação

### 1. Oracle Instant Client

Instale o Oracle Instant Client para permitir a conectividade com o banco:

```bash
dnf install -y oracle-instantclient-release-el8
dnf install -y oracle-instantclient-basic oracle-instantclient-devel oracle-instantclient-sqlplus
```

### 2. Download e Extração do Exporter

Crie um diretório de trabalho e baixe o binário standalone e a configuração de métricas padrão:

```bash
mkdir -p /exporter/
cd /exporter/
touch alert.log

# Ajuste as versões conforme necessário
wget https://github.com/oracle/oracle-db-appdev-monitoring/releases/download/2.2.2/oracledb_exporter-2.2.2.linux-amd64-glibc-2.28.tar.gz
wget https://github.com/oracle/oracle-db-appdev-monitoring/releases/download/2.2.2/default-metrics.toml

tar -zxvf oracledb_exporter-2.2.2.linux-amd64-glibc-2.28.tar.gz
mv default-metrics.toml oracledb_exporter-2.2.2.linux-amd64/
```

## Configuração

Crie o arquivo `exporter-config.yaml` dentro do diretório do exporter.

### Exemplo para Instância Única/PDB:

```yaml
databases:
  default:
    username: USR_EXPORTER
    password: SUA_SENHA
    url: 192.168.68.114:1521/PRD1
    queryTimeout: 10
metrics:
  default: default-metrics.toml
log:
  destination: /exporter/alert.log
  interval: 15s
```

### Exemplo para Multitenant (Múltiplos PDBs):

```yaml
databases:
  db1:
    username: USR_EXPORTER
    password: SUA_SENHA
    url: 192.168.68.114:1521/PRD1
  db2:
    username: USR_EXPORTER
    password: SUA_SENHA
    url: 192.168.68.114:1521/PRD2
metrics:
  default: default-metrics.toml
log:
  destination: /exporter/alert.log
```

## Executando o Exporter

Inicie o binário apontando para o seu arquivo de configuração:

```bash
./oracledb_exporter --config.file=exporter-config.yaml
```

Com o exporter rodando, as métricas estarão disponíveis em `http://<ip-do-servidor>:9161/metrics`.

## Integração com Prometheus

Para coletar estas métricas com o Prometheus, adicione o seguinte alvo ao seu `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: "oracle_exporter"
    static_configs:
      - targets: ["localhost:9161"]
```

## Métricas Customizadas

O arquivo `default-metrics.toml` já contém diversas consultas úteis. A flexibilidade permitida pelo Oracle AI Exporter possibilita a monitoração de qualquer KPI via SQL sem a necessidade de licenças extras como o Tuning Pack.
