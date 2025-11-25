// 1. IMPORTAR A CONEXÃO (Certifique-se que o arquivo supabaseClient.js existe na mesma pasta)
import { _supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', function() {
    
    // --- A. INICIALIZAÇÃO VISUAL ---

    // 1. Partículas (Fundo Matrix/Tech)
    tsParticles.load("tsparticles", {
        background: { color: { value: "#0a0a0a" } },
        fpsLimit: 60,
        interactivity: {
            events: { onClick: { enable: true, mode: "push" }, onHover: { enable: true, mode: "repulse" } },
            modes: { push: { quantity: 4 }, repulse: { distance: 100, duration: 0.4 } }
        },
        particles: {
            color: { value: "#39ff14" },
            links: { color: "#39ff14", distance: 150, enable: true, opacity: 0.3, width: 1 },
            move: { enable: true, speed: 1.5 },
            number: { density: { enable: true, area: 800 }, value: 60 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } }
        },
        detectRetina: true
    });

    // 2. Swiper (Carrossel da Equipe)
    new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: { delay: 3000, disableOnInteraction: false },
        pagination: { el: ".swiper-pagination", clickable: true },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });

    // --- B. INTEGRAÇÃO COM SUPABASE ---

    // 3. Carregar Notícias
    carregarNoticias();

    // 4. Carregar Calendário (Com eventos do Banco)
    carregarCalendario();

    // 5. Carregar Documentos
    carregarDocumentos();

    // 6. Configurar Formulário de Denúncia
    setupDenunciaForm();
});

// --- FUNÇÕES AUXILIARES ---

async function carregarNoticias() {
    const container = document.getElementById('mural-noticias-container');
    const { data: noticias, error } = await _supabase
        .from('noticias')
        .select('*')
        .order('data', { ascending: false })
        .limit(5); // Pega as 5 últimas

    if (error) {
        console.error('Erro ao carregar notícias:', error);
        container.innerHTML = '<p>Erro ao carregar notícias.</p>';
        return;
    }

    if (!noticias || noticias.length === 0) {
        container.innerHTML = '<p>Nenhuma notícia encontrada.</p>';
        return;
    }

    container.innerHTML = ''; // Limpa
    noticias.forEach(noticia => {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <h4>${noticia.titulo}</h4>
            <span class="date">${formatarData(noticia.data)}</span>
            <div class="resumo">${noticia.resumo}</div>
        `;
        container.appendChild(div);
    });
}

async function carregarCalendario() {
    const calendarEl = document.getElementById('calendar');
    
    // Busca eventos no Supabase
    const { data: eventosDB, error } = await _supabase.from('eventos').select('*');
    
    let eventosFormatados = [];
    if (!error && eventosDB) {
        eventosFormatados = eventosDB.map(e => ({
            title: e.titulo,
            start: e.data, // Certifique-se que no banco é YYYY-MM-DD
            allDay: true
        }));
    }

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        themeSystem: 'standard',
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth' // Removeu botões desnecessários para mobile
        },
        height: 'auto',
        events: eventosFormatados, // Injeta os eventos do banco
        eventColor: '#39ff14',
        eventTextColor: '#000'
    });
    calendar.render();
}

async function carregarDocumentos() {
    const container = document.getElementById('lista-documentos-container');
    const { data: docs, error } = await _supabase
        .from('documentos')
        .select('*')
        .order('created_at', { ascending: false });

    if (!docs || docs.length === 0) {
        container.innerHTML = '<p>Nenhum documento.</p>';
        return;
    }

    let html = '<ul>';
    docs.forEach(doc => {
        html += `<li><a href="${doc.url_publica}" target="_blank"><i class="fas fa-file-pdf"></i> ${doc.titulo}</a></li>`;
    });
    html += '</ul>';
    container.innerHTML = html;
}

function setupDenunciaForm() {
    const form = document.getElementById('form-denuncia');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = document.getElementById('denuncia-tipo').value;
        const descricao = document.getElementById('denuncia-desc').value;
        const btn = form.querySelector('button');

        btn.disabled = true;
        btn.textContent = "Enviando...";

        const { error } = await _supabase
            .from('denuncias')
            .insert([{ tipo, descricao }]);

        if (error) {
            alert('Erro ao enviar denúncia: ' + error.message);
        } else {
            alert('Denúncia enviada com sucesso! Seus dados estão seguros.');
            form.reset();
        }
        btn.disabled = false;
        btn.textContent = "Enviar";
    });
}

function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}