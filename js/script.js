// Importa a conexão PRONTA do nosso arquivo central
import { _supabase } from './supabaseClient.js';

// --- PASSO 1: O que fazer quando a página carregar ---
document.addEventListener('DOMContentLoaded', () => {
    // Carrega todo o conteúdo dinâmico
    carregarNoticias();
    carregarCalendario();
    carregarDocumentos();
    
    // Liga o formulário de denúncia
    setupDenunciaForm();

    // Liga as animações "suaves" de fade-in
    setupFadeInAnimations();
});

// --- PASSO 2: FUNÇÃO PARA CARREGAR NOTÍCIAS ---
async function carregarNoticias() {
    const mural = document.getElementById('mural-noticias');
    if (!mural) return; 
    mural.innerHTML = "<p>Carregando notícias...</p>"; 
    try {
        const { data: noticias, error } = await _supabase.from('noticias').select('*').order('data', { ascending: false });
        if (error) throw error;
        if (noticias.length === 0) {
            mural.innerHTML = "<p>Nenhuma notícia publicada ainda.</p>";
            return;
        }
        mural.innerHTML = '';
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
        mural.innerHTML = "<p>Erro ao carregar notícias.</p>";
    }
}

// --- PASSO 3: FUNÇÃO PARA CARREGAR O CALENDÁRIO ---
async function carregarCalendario() {
    const calendarEl = document.getElementById('calendar-container');
    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        locale: 'pt-br',
        buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana' },
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const { data, error } = await _supabase.from('eventos').select('titulo, data');
                if (error) throw error;
                const eventosFormatados = data.map(evento => ({
                    title: evento.titulo,
                    start: evento.data
                }));
                successCallback(eventosFormatados);
            } catch (error) { failureCallback(error); }
        },
        dateClick: (info) => alert('Você clicou no dia: ' + info.dateStr),
        eventClick: (info) => alert('Evento: ' + info.event.title)
    });
    calendar.render();
}

// --- PASSO 4: FUNÇÃO PARA CARREGAR DOCUMENTOS ---
async function carregarDocumentos() {
    const listaDiv = document.getElementById('lista-de-documentos');
    if (!listaDiv) return;
    listaDiv.innerHTML = "<p>Carregando documentos...</p>";
    try {
        const { data, error } = await _supabase.from('documentos').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data.length === 0) {
            listaDiv.innerHTML = '<p>Nenhum documento publicado.</p>';
            return;
        }
        listaDiv.innerHTML = ''; 
        const ul = document.createElement('ul');
        ul.className = 'links-importantes'; // Reutilizando o estilo
        data.forEach(doc => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${doc.url_publica}" target="_blank">${doc.titulo}</a>`;
            ul.appendChild(li);
        });
        listaDiv.appendChild(ul);
    } catch (error) {
        console.error('Erro ao carregar documentos:', error.message);
        listaDiv.innerHTML = '<p>Erro ao carregar documentos.</p>';
    }
}

// --- PASSO 5: FUNÇÃO PARA FORMULÁRIO DE DENÚNCIA ---
function setupDenunciaForm() {
    const formDenuncia = document.getElementById('form-denuncia');
    if (!formDenuncia) return;

    formDenuncia.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = document.getElementById('tipo').value;
        const descricao = document.getElementById('descricao').value;
        try {
            const { error } = await _supabase.from('denuncias').insert({ tipo: tipo, descricao: descricao });
            if (error) throw error;
            alert('Denúncia enviada anonimamente. Obrigado.');
            formDenuncia.reset();
        } catch (error) {
            alert('Erro ao enviar: ' + error.message);
        }
    });
}

// --- PASSO 6: A MÁGICA "SUAVE" (Animação de Fade-in) ---
function setupFadeInAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1 // Ativa quando 10% do item estiver visível
    });

    // Observa todas as seções com a classe .fade-in
    document.querySelectorAll('.fade-in').forEach(section => {
        observer.observe(section);
    });
}

// --- PASSO 7: Função helper de data (reutilizável) ---
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}