# Questify

Aplicação de login e cadastro com frontend estático, API REST em Node.js e banco PostgreSQL do Supabase, tanto localmente quanto na Vercel.

## Estrutura

- `frontend/`: páginas, estilos e JavaScript do navegador.
- `backend/server.js`: API de autenticação e servidor dos arquivos do frontend.
- `api/auth/[action].js`: função serverless de autenticação para a Vercel.
- `supabase/migrations/`: schema versionado das tabelas da aplicação.

## Executar

Requer Node.js 22.13 ou superior e a connection string do pooler de transações do Supabase em `SUPABASE_DB_URL`. Instale as dependências com `npm install` e inicie o servidor:

```bash
export SUPABASE_DB_URL='postgres://postgres.PROJECT_REF:SENHA@aws-0-REGIAO.pooler.supabase.com:6543/postgres'
npm start
```

Obtenha a URL no painel Supabase em **Connect → Transaction pooler**. Abra `http://127.0.0.1:8000`. O servidor cria as tabelas `users` e `sessions` automaticamente se ainda não existirem. A tabela `users` armazena o hash PBKDF2-SHA256 da senha, nunca a senha original.

## Publicar na Vercel

1. Importe este repositório como um projeto na Vercel. A configuração em `vercel.json` publica `frontend/` como site estático e mantém `api/` como funções Node.js.
2. No projeto Supabase, obtenha a connection string em **Connect → Transaction pooler**. Configure-a como `SUPABASE_DB_URL` nas variáveis do projeto Vercel, para Preview, Production e Development conforme necessário. Mantenha a variável privada e não use prefixo `NEXT_PUBLIC_`.
3. Faça o deploy. As tabelas `users` e `sessions` são criadas automaticamente na primeira chamada da API. O schema também está versionado em `supabase/migrations/20261029000000_create_auth_tables.sql` para aplicação pelo Supabase CLI ou SQL Editor.

O arquivo SQLite que estava no repositório não é mais utilizado nem migrado automaticamente. Faça uma migração manual se precisar preservar as contas antigas. O login do Questify usa tabelas próprias e não depende do Supabase Auth.

O login cria tokens e registra sua sessão, mas o frontend atual não envia esses tokens em chamadas autenticadas nem há uma rota de logout.

## Rotas

- `POST /api/auth/register` com `{ "name", "email", "password" }`
- `POST /api/auth/login` com `{ "email", "password" }`

As respostas de erro usam status HTTP apropriados, como `401` para credenciais inválidas e `409` para e-mail já cadastrado. O backend usa `node:sqlite` integrado ao Node.js, sem dependências npm externas.
