# Questify

Frontend de login e cadastro com API REST local em Node.js e SQLite.

## Executar

Requer Node.js 22.13 ou superior. Na pasta do projeto, execute:

```bash
npm start
```

Abra `http://127.0.0.1:8000`. O servidor cria `questify.sqlite3` automaticamente. A tabela `users` armazena nome, e-mail e hash da senha (PBKDF2-SHA256); a senha original não é gravada. A tabela `sessions` armazena hashes dos tokens de sessão.

## Rotas

- `POST /api/auth/register` com `{ "name", "email", "password" }`
- `POST /api/auth/login` com `{ "email", "password" }`

As respostas de erro usam status HTTP apropriados, como `401` para credenciais inválidas e `409` para e-mail já cadastrado. O banco pode ser localizado noutro caminho definindo `QUESTIFY_DB` antes de iniciar o servidor. O backend usa o módulo SQLite integrado ao Node.js, sem dependências npm externas.
