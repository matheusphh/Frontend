// 1. LÓGICA DE LOGIN (index.html)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        errorMessage.classList.add('hidden');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'E-mail ou senha inválidos.');
            
            // Armazenando os tokens de acesso e sessão
            localStorage.setItem('questify_access_token', data.accessToken);
            localStorage.setItem('questify_refresh_token', data.refreshToken);

            // Redireciona para a página principal
            window.location.href = 'dashboard.html';

        } catch (error) {
            errorMessage.textContent = error.message || 'Erro ao conectar com o servidor.';
            errorMessage.classList.remove('hidden');
        }
    });
}

// 2. VALIDAÇÃO VISUAL DA SENHA EM TEMPO REAL (register.html)
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;

        const lengthReq = document.getElementById('length');
        const uppercaseReq = document.getElementById('uppercase');
        const numberReq = document.getElementById('number');
        const symbolReq = document.getElementById('symbol');

        // Critério 1: Mínimo de 8 caracteres
        if (val.length >= 8) {
            lengthReq.style.color = '#10b981'; // Verde
            lengthReq.textContent = '✔️ Pelo menos 8 caracteres';
        } else {
            lengthReq.style.color = '#ef4444'; // Vermelho
            lengthReq.textContent = '❌ Pelo menos 8 caracteres';
        }

        // Critério 2: Letras maiúsculas e minúsculas
        if (/[a-z]/.test(val) && /[A-Z]/.test(val)) {
            uppercaseReq.style.color = '#10b981';
            uppercaseReq.textContent = '✔️ Letra maiúscula e minúscula';
        } else {
            uppercaseReq.style.color = '#ef4444';
            uppercaseReq.textContent = '❌ Letra maiúscula e minúscula';
        }

        // Critério 3: Números
        if (/\d/.test(val)) {
            numberReq.style.color = '#10b981';
            numberReq.textContent = '✔️ Pelo menos um número';
        } else {
            numberReq.style.color = '#ef4444';
            numberReq.textContent = '❌ Pelo menos um número';
        }

        // Critério 4: Símbolos
        if (/[@$!%*?&._-]/.test(val)) {
            symbolReq.style.color = '#10b981';
            symbolReq.textContent = '✔️ Pelo menos um símbolo (!@#$...)';
        } else {
            symbolReq.style.color = '#ef4444';
            symbolReq.textContent = '❌ Pelo menos um símbolo (!@#$...)';
        }
    });
}

// 3. LÓGICA DE CADASTRO (register.html)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');

        errorMessage.classList.add('hidden');
        successMessage.classList.add('hidden');

        // Validação final de segurança da senha antes do envio
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/;
        if (!passwordRegex.test(password)) {
            errorMessage.textContent = 'A senha deve cumprir todos os requisitos de segurança indicados.';
            errorMessage.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro ao criar conta.');

            successMessage.textContent = 'Conta criada com sucesso! Redirecionando...';
            successMessage.classList.remove('hidden');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            errorMessage.textContent = error.message || 'Erro ao conectar com o servidor.';
            errorMessage.classList.remove('hidden');
        }
    });
}
