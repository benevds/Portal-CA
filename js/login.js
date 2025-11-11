// Importa a conexão PRONTA do nosso arquivo central
import { _supabase } from './supabaseClient.js';

// Pega os elementos do formulário
const loginForm = document.getElementById('form-login');
const errorMessage = document.getElementById('error-message');

// Adiciona um "escutador" para quando o formulário for enviado
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede que a página recarregue

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    errorMessage.textContent = ''; // Limpa erros antigos

    try {
        // Tenta fazer o login com o Supabase Auth
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            throw error; // Joga o erro para o "catch"
        }

        // Se o login der certo...
        console.log('Login bem-sucedido!', data);
        
        // Redireciona o usuário para a página de admin
        window.location.href = 'admin.html';

    } catch (error) {
        console.error('Erro no login:', error.message);
        errorMessage.textContent = 'E-mail ou senha inválidos. Tente novamente.';
    }
});