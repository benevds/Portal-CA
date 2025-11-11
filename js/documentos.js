import { _supabase } from './supabaseClient.js';

// Função para carregar e mostrar os documentos
async function carregarDocumentos() {
    const listaDiv = document.getElementById('lista-de-documentos');
    
    try {
        const { data, error } = await _supabase
            .from('documentos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data.length === 0) {
            listaDiv.innerHTML = '<p>Nenhum documento publicado ainda.</p>';
            return;
        }

        listaDiv.innerHTML = ''; // Limpa o "carregando"
        
        // Estilo simples para a lista (você pode melhorar no CSS)
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        
        data.forEach(doc => {
            const li = document.createElement('li');
            li.style.borderBottom = '1px solid #eee';
            li.style.padding = '15px 0';
            li.innerHTML = `
                <a href="${doc.url_publica}" target="_blank" style="font-size: 1.2rem; font-weight: 600;">
                    ${doc.titulo}
                </a>
                <p style="color: #555;">${doc.descricao || 'Sem descrição.'}</p>
                <a href="${doc.url_publica}" target="_blank" class="btn-download" style="font-size: 0.9rem; text-decoration: underline;">
                    Baixar/Visualizar
                </a>
            `;
            ul.appendChild(li);
        });
        listaDiv.appendChild(ul);

    } catch (error) {
        console.error('Erro ao carregar documentos:', error.message);
        listaDiv.innerHTML = '<p>Erro ao carregar documentos.</p>';
    }
}

// Roda a função quando a página carregar
document.addEventListener('DOMContentLoaded', carregarDocumentos);