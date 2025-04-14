# 🛠️ Setup Completo EC2 + Deploy GitHub Actions + PM2

Este guia resume todos os comandos utilizados para configurar e manter sua aplicação NestJS rodando em uma instância EC2 da AWS.

---

## ✅ Conectando na EC2

```bash
# Conecte na VM com sua chave .pem
ssh -i "nestjs-company.pem" ubuntu@<seu-endereco-publico>
```

---

## 🐘 Subindo PostgreSQL com Docker

```bash
# Crie o arquivo docker-compose.yml
nano docker-compose.yml
```

Conteúdo do arquivo:

```yaml
services:
  postgres:
    image: postgres:15
    container_name: kpmg-postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "${POSTGRES_PORT}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
# Suba o container
docker compose up -d
```

---

## ⚙️ Preparando o ambiente do projeto

```bash
# Clone seu projeto
git clone git@github.com:AlexandreNoguez/company-crud-server.git

# Acesse a pasta
cd company-crud-server

# Instale as dependências
npm install

# Crie o .env
cp .env.example .env
nano .env
```

> 🔑 Preencha as variáveis corretamente com a URL do banco, porta, e demais configs.

```bash
# Compile o projeto
npm run build
```

---

## 🔐 Criando SSH para GitHub Actions

```bash
# Gere uma nova chave SSH
ssh-keygen -t ed25519 -C "ec2-deploy"

# Copie a chave pública
cat ~/.ssh/id_ed25519.pub
```

> ✅ Adicione esta chave no GitHub: `Settings > Deploy keys > Add key (com write access)`

```bash
# Copie o conteúdo da chave privada
cat ~/.ssh/id_ed25519
```

> 🔒 Salve a chave privada no GitHub: `Settings > Secrets and variables > Actions > New secret`

- Nome: `EC2_SSH_KEY`

Adicione também as secrets:

- `EC2_USER`: ubuntu
- `EC2_HOST`: ec2-xxx.compute-1.amazonaws.com

---

## 🚀 Configurando PM2

```bash
# Instale globalmente
npm install -g pm2

# Inicie a aplicação
pm2 start dist/src/main.js --name nestjs-api

# Salve a lista de processos
pm2 save

# Configure o pm2 para rodar após reboot
pm2 startup

# Copie e execute o comando sugerido (ex:)
sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/vXX/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## 🤖 Configuração GitHub Actions (release.yml)

Na pasta `.github/workflows/release.yml`:

```yaml
name: Release and Deploy to EC2

on:
  push:
    branches:
      - main

jobs:
  release:
    ...
  deploy:
    needs: release
    ...
    steps:
      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H $EC2_HOST >> ~/.ssh/known_hosts
        env:
          SSH_KEY: ${{ secrets.EC2_SSH_KEY }}
          EC2_HOST: ${{ secrets.EC2_HOST }}

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/workspace/company-crud-server
            git pull origin main
            npm install
            npm run build
            pm2 reload nestjs-api || pm2 start dist/src/main.js --name nestjs-api
```

---

## 🧪 Rodando testes na EC2 (opcional)

```bash
npm run test
npm run test:cov
npm run test:e2e
```

---

> 📌 Agora toda vez que você fizer `git push` na branch `main`, o GitHub Actions irá:
>
> - Incrementar a versão
> - Criar e subir uma tag
> - Acessar a EC2 via SSH
> - Atualizar o código, buildar e reiniciar com PM2 ✅

---
