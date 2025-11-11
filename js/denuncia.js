import { _supabase } from './supabaseClient.js';

const formDenuncia = document.getElementById('form-denuncia');

formDenuncia.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Pega os dados do formulário
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value;
    
    try {
        // Tenta inserir na tabela 'denuncias'
        const { error } = await _supabase
            .from('denuncias')
            .insert({ tipo: tipo, descricao: descricao });
        
        if (error) {
            throw error;
        }

        alert('Denúncia enviada anonimamente. Obrigado pela sua contribuição!');
        formDenuncia.reset();

    } catch (error) {
        alert('Erro ao enviar: ' + error.message);
    }
});