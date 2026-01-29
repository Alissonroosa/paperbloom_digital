# 🛠️ Comandos Úteis - Coolify & Docker

## 📦 Comandos Docker no Servidor

### Ver Containers Rodando
```bash
docker ps
```

### Ver Logs do Container
```bash
# Logs em tempo real
docker logs -f <container-id>

# Últimas 100 linhas
docker logs --tail 100 <container-id>

# Logs com timestamp
docker logs -t <container-id>
```

### Acessar Container
```bash
# Entrar no container
docker exec -it <container-id> sh

# Executar comando único
docker exec <container-id> npm run db:migrate
```

### Verificar Recursos
```bash
# CPU, Memória, Rede
docker stats <container-id>

# Informações detalhadas
docker inspect <container-id>
```

### Reiniciar Container
```bash
docker restart <container-id>
```

### Parar/Iniciar Container
```bash
docker stop <container-id>
docker start <container-id>
```

---

## 🔍 Debugging no Servidor

### Verificar Health Check
```bash
# Dentro do servidor
curl http://localhost:3000/api/health

# De fora
curl https://seu-dominio.com.br/api/health
```

### Testar Conexão com Banco
```bash
# Entrar no container
docker exec -it <container-id> sh

# Testar conexão PostgreSQL
nc -zv <db-host> 5432

# Ou usar psql
apk add postgresql-client
psql $DATABASE_URL -c "SELECT 1"
```

### Verificar Variáveis de Ambiente
```bash
docker exec <container-id> env | grep -E "DATABASE|STRIPE|R2|RESEND"
```

### Verificar Disco
```bash
# Espaço usado pelo container
docker exec <container-id> df -h

# Espaço usado por imagens
docker system df
```

---

## 🗄️ Comandos de Banco de Dados

### Executar Migrations
```bash
docker exec <container-id> npm run db:migrate
```

### Verificar Schema
```bash
docker exec <container-id> npm run db:verify
```

### Backup do Banco
```bash
# No servidor PostgreSQL
pg_dump -U usuario -d paperbloom > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U usuario -d paperbloom < backup_20260128.sql
```

---

## 🧹 Limpeza e Manutenção

### Limpar Containers Parados
```bash
docker container prune
```

### Limpar Imagens Antigas
```bash
docker image prune -a
```

### Limpar Tudo (CUIDADO!)
```bash
docker system prune -a --volumes
```

### Ver Espaço em Disco
```bash
docker system df -v
```

---

## 📊 Monitoramento

### Logs de Erro
```bash
# Filtrar apenas erros
docker logs <container-id> 2>&1 | grep -i error

# Últimos erros
docker logs --tail 50 <container-id> 2>&1 | grep -i error
```

### Monitorar Requisições
```bash
# Logs em tempo real
docker logs -f <container-id> | grep -E "GET|POST|PUT|DELETE"
```

### Verificar Uptime
```bash
docker inspect <container-id> | grep StartedAt
```

---

## 🔄 Deploy e Atualização

### Forçar Rebuild
No Coolify:
1. Settings → Build
2. Marcar "Force Rebuild"
3. Deploy

### Rollback para Versão Anterior
No Coolify:
1. Deployments → Histórico
2. Selecionar versão anterior
3. Redeploy

### Deploy Manual via Git
```bash
# No servidor
cd /path/to/app
git pull origin main
docker-compose up -d --build
```

---

## 🔐 Segurança

### Verificar Portas Expostas
```bash
docker port <container-id>
```

### Verificar Logs de Segurança
```bash
docker logs <container-id> | grep -i "unauthorized\|forbidden\|denied"
```

### Atualizar Secrets
No Coolify:
1. Environment Variables
2. Editar variável
3. Redeploy

---

## 📈 Performance

### Verificar Uso de Memória
```bash
docker stats --no-stream <container-id>
```

### Verificar Processos
```bash
docker exec <container-id> ps aux
```

### Verificar Conexões de Rede
```bash
docker exec <container-id> netstat -an | grep ESTABLISHED
```

---

## 🆘 Troubleshooting Rápido

### Container não inicia
```bash
# Ver logs de erro
docker logs <container-id>

# Verificar health check
docker inspect <container-id> | grep Health -A 10
```

### Erro de memória
```bash
# Aumentar limite de memória no Coolify
# Settings → Resources → Memory Limit
```

### Erro de conexão com banco
```bash
# Testar conexão
docker exec <container-id> nc -zv <db-host> 5432

# Verificar DATABASE_URL
docker exec <container-id> env | grep DATABASE_URL
```

### Erro 502 Bad Gateway
```bash
# Verificar se container está rodando
docker ps | grep <container-name>

# Verificar logs
docker logs --tail 50 <container-id>

# Reiniciar
docker restart <container-id>
```

---

## 📞 Comandos de Emergência

### Reiniciar Tudo
```bash
docker restart <container-id>
```

### Parar e Remover Container
```bash
docker stop <container-id>
docker rm <container-id>
```

### Rebuild Completo
```bash
# No Coolify: Force Rebuild + Deploy
# Ou manualmente:
docker-compose down
docker-compose up -d --build --force-recreate
```

---

## 💡 Dicas

1. **Sempre faça backup antes de mudanças críticas**
2. **Use logs para debug: `docker logs -f`**
3. **Monitore recursos: `docker stats`**
4. **Teste em staging antes de produção**
5. **Configure alertas no Coolify**

---

**Comandos salvos! Use com sabedoria! 🚀**
