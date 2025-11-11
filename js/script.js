// Importa a conexão PRONTA do nosso arquivo central
import { _supabase } from './supabaseClient.js';

// --- PASSO 1: O que fazer quando a página carregar ---
document.addEventListener('DOMContentLoaded', () => {
    // A única coisa que o index.html faz é carregar as notícias
    carregarNoticias();
});


// --- PASSO 2: FUNÇÃO PARA CARREGAR NOTÍCIAS ---
async function carregarNoticias() {
    const mural = document.getElementById('mural-noticias');
    
    // Se não achar o mural (só por segurança), não faz nada
    if (!mural) {
        console.error('Elemento "mural-noticias" não encontrado.');
        return; 
    }

    mural.innerHTML = "<p>Carregando notícias...</p>"; 

    try {
        const { data: noticias, error } = await _supabase
            .from('noticias')       // Da tabela 'noticias'
            .select('*')            // Selecione todas as colunas
            .order('data', { ascending: false }); // Ordenado pela data, mais nova primeiro

        if (error) {
            throw error; // Joga o erro para o "catch"
        }

        if (noticias.length === 0) {
            mural.innerHTML = "<p>Nenhuma notícia publicada ainda.</p>";
            return;
        }

        // Limpa o mural
        mural.innerHTML = '';

        // Desenha os cards
        noticias.forEach(noticia => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <h3>${noticia.titulo}</h3>
                <div class="data">${formatarData(noticia.data)}</div>
                <p>${noticia.resumo}</p>
            `;
            mural.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar notícias:", error.message);
        mural.innerHTML = "<p>Erro ao carregar notícias. Tente novamente mais tarde.</p>";
    }
}


// --- PASSO 3: Função helper de data ---
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}