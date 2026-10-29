# Questify

Aplicação de login e cadastro com frontend estático, API REST em Node.js e PostgreSQL externo, tanto localmente quanto na Vercel.

## Estrutura

- `frontend/`: páginas, estilos e JavaScript do navegador.
- `backend/server.js`: API de autenticação e servidor dos arquivos do frontend.
- `api/auth/[action].js`: função serverless de autenticação para a Vercel.

## Executar

Requer Node.js 22.13 ou superior e uma URL de conexão PostgreSQL em `POSTGRES_URL`. Instale as dependências com `npm install` e inicie o servidor:

```bash
export POSTGRES_URL='postgres://usuario:senha@host/banco?sslmode=require'
npm start
```

Abra `http://127.0.0.1:8000`. O servidor cria as tabelas `users` e `sessions` automaticamente se ainda não existirem. A tabela `users` armazena o hash PBKDF2-SHA256 da senha, nunca a senha original.

## Publicar na Vercel

1. Importe este repositório como um projeto na Vercel. A configuração em `vercel.json` publica `frontend/` como site estático e mantém `api/` como funções Node.js.
2. Conecte um banco PostgreSQL compatível com `@vercel/postgres` ao projeto (por exemplo, uma integração Neon) e disponibilize a variável `POSTGRES_URL` nos ambientes Preview e Production. Use a mesma URL localmente se quiser compartilhar os mesmos dados.
3. Faça o deploy. As tabelas `users` e `sessions` são criadas automaticamente na primeira chamada da API.

O arquivo SQLite que estava no repositório não é mais utilizado nem migrado automaticamente. Faça uma migração manual se precisar preservar as contas antigas.

O login cria tokens e registra sua sessão, mas o frontend atual não envia esses tokens em chamadas autenticadas nem há uma rota de logout.

## Rotas

- `POST /api/auth/register` com `{ "name", "email", "password" }`
- `POST /api/auth/login` com `{ "email", "password" }`

As respostas de erro usam status HTTP apropriados, como `401` para credenciais inválidas e `409` para e-mail já cadastrado. O backend usa `node:sqlite` integrado ao Node.js, sem dependências npm externas.
