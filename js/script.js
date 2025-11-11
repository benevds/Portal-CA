// Importa a conexão PRONTA do nosso arquivo central
import { _supabase } from './supabaseClient.js';

// Função que "escuta" quando a página terminou de carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarNoticias();
    carregarEventos();
});

// --- FUNÇÃO PARA CARREGAR NOTÍCIAS ---
async function carregarNoticias() {
    const mural = document.getElementById('mural-noticias');
    mural.innerHTML = "<p>Carregando notícias...</p>"; // Feedback

    try {
        // A "pergunta" ao banco de dados Supabase
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

// --- FUNÇÃO PARA CARREGAR EVENTOS ---
async function carregarEventos() {
    const agenda = document.getElementById('agenda-eventos');
    agenda.innerHTML = "<p>Carregando eventos...</p>";

    try {
        const { data: eventos, error } = await _supabase
            .from('eventos')
            .select('*')
            .order('data', { ascending: false });

        if (error) throw error;

        if (eventos.length === 0) {
            agenda.innerHTML = "<p>Nenhum evento agendado.</p>";
            return;
        }

        agenda.innerHTML = '';

        eventos.forEach(evento => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <h3>${evento.titulo}</h3>
                <div class="data">${formatarData(evento.data)} - ${evento.local || 'Local a definir'}</div>
            `;
            agenda.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar eventos:", error.message);
        agenda.innerHTML = "<p>Erro ao carregar eventos.</p>";
    }
}

// Função extra para formatar a data (AAAA-MM-DD -> DD/MM/AAAA)
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}