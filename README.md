# 📘 Documentação do Projeto Fullstack - KPMG

## 📌 Descrição

Aplicação fullstack desenvolvida para o desafio técnico da KPMG, com foco em cadastro, listagem, edição e remoção de empresas, utilizando tecnologias modernas e boas práticas de arquitetura, testes e organização de código.

## 🧱 Tecnologias Utilizadas

- NestJS + TypeScript
- TypeORM + PostgreSQL
- Sentry
- Swagger
- Jest (Unit e E2E tests)

## 📁 Estrutura do Projeto

```plaintext
src/
├── app.module.ts
├── main.ts
├── test/
│   └── app.e2e-spec.ts
├── @types/
│   └── company.type.ts
├── config/
│   └── config-loader.ts
├── constants/
│   └── email-templates.constant.ts
├── modules/
│   ├── company/
│   └── seed/
├── enums/
│   ├── email-templates.enum.ts/
├── shared/
│   ├── email/
│   ├── filters/
│   └── helpers/
```

## 🔄 Funcionalidades

- CRUD de empresas com envio de e-mails
- Soft delete
- Paginação e busca com `ILIKE` + `QueryBuilder`
- Validação de entrada com DTOs
- Integração com Sentry e Swagger

## 📧 Integração com E-mail

- Serviço configurado com Nodemailer
- Headers como `List-Unsubscribe` adicionados
- Templates para criação e atualização de empresas

## ✅ Testes Realizados

- Testes unitários em serviços, helpers e filtros
- Testes e2e para rota raiz e criação de empresas

## 🔧 Como Executar o Projeto

```bash
git clone https://github.com/AlexandreNoguez/company-crud-server
cd server
cp .env.example .env
npm install
npm run start:dev
```

### _OBS.: Configure as variáveis de ambiente do .env_ e clone também o repositório <a href="https://github.com/AlexandreNoguez/company-crud-client">company-crud-client</a>

O app estará acessível em: <a href="http://localhost:3000">localhost</a>
O swagger em NODE_ENV=development pode ser acessado pelo <a href="http://localhost:3000/api">Swagger</a>
