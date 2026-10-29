# Questify

Aplicação de login e cadastro com frontend estático, API REST em Node.js e banco SQLite.

## Estrutura

- `frontend/`: páginas, estilos e JavaScript do navegador.
- `backend/server.js`: API de autenticação e servidor dos arquivos do frontend.
- `backend/data/questify.sqlite3`: banco SQLite usado pelo servidor.

## Executar

Requer Node.js 22.13 ou superior. Na pasta do projeto, execute:

```bash
npm start
```

Abra `http://127.0.0.1:8000`. O servidor cria o arquivo do banco e as tabelas `users` e `sessions` automaticamente se ainda não existirem. A tabela `users` armazena o hash PBKDF2-SHA256 da senha, nunca a senha original.

É possível escolher outro caminho para o banco definindo `QUESTIFY_DB` antes de iniciar o servidor.

## Rotas

- `POST /api/auth/register` com `{ "name", "email", "password" }`
- `POST /api/auth/login` com `{ "email", "password" }`

As respostas de erro usam status HTTP apropriados, como `401` para credenciais inválidas e `409` para e-mail já cadastrado. O backend usa `node:sqlite` integrado ao Node.js, sem dependências npm externas.
