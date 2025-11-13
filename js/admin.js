// Importa a conexão PRONTA do nosso arquivo central (ESSENCIAL!)
import { _supabase } from './supabaseClient.js';

// Variável para guardar o ID da NOTÍCIA que estamos editando
let currentEditingId = null;

// --- PASSO 1: VERIFICAÇÃO DE SEGURANÇA ---
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await _supabase.auth.getSession();

    if (!session) {
        alert('Acesso negado. Faça o login primeiro.');
        window.location.href = 'login.html';
        return;
    }

    console.log('Usuário logado:', session.user.email);
    
    // Carrega TODAS as seções
    carregarNoticiasAdmin();
    carregarEventosAdmin();
    carregarDocumentosAdmin();
    carregarDenunciasAdmin();
    carregarEquipeAdmin(); 

    // Liga a mágica das Abas
    setupTabs();

    // A MÁGICA "ALTO NÍVEL": LIGA O EDITOR DE TEXTO
    tinymce.init({
        selector: 'textarea#resumo', // <== ACHA O SEU CAMPO DE RESUMO DE NOTÍCIAS
        skin: "oxide-dark", // <== SKIN "TECH" PARA COMBINAR COM SEU SITE
        content_css: "dark",
        plugins: 'lists link autoresize',
        toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | link',
        autoresize_bottom_margin: 20,
        menubar: false,
    });
});


// --- PASSO 2: FUNCIONALIDADE DE LOGOUT ---
const btnLogout = document.getElementById('btn-logout');
btnLogout.addEventListener('click', async () => {
    const { error } = await _supabase.auth.signOut();
    if (error) {
        console.error('Erro ao sair:', error.message);
    } else {
        alert('Você saiu da sua conta.');
        window.location.href = 'login.html';
    }
});

// --- PASSO 3: MÁGICA DAS ABAS DO DASHBOARD ---
function setupTabs() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const tabPanes = document.querySelectorAll('.admin-content .tab-pane');

    navLinks.forEach(link => {
        if (link.id === 'btn-logout') return;
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
            const tabId = link.getAttribute('data-tab');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            navLinks.forEach(nav => nav.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            link.classList.add('active');
        });
    });
}


/* =============================================
   =========== LÓGICA DO CRUD DE NOTÍCIAS ========
   ============================================= */

// --- CADASTRAR/ATUALIZAR NOTÍCIA (CORRIGIDO por você) ---
const formNoticia = document.getElementById('form-nova-noticia');
const successMessage = document.getElementById('success-message');

formNoticia.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    // Pega os valores do formulário
    const titulo = document.getElementById('titulo').value;
    const data = document.getElementById('data').value;
    // O MAIS IMPORTANTE: Pega o resumo do editor TinyMCE
    const editorInstance = tinymce.get('resumo');
    const resumo = editorInstance ? editorInstance.getContent() : document.getElementById('resumo').value; // <== A CHECAGEM DE SEGURANÇA
    
    successMessage.textContent = ''; // Limpa mensagens

    try {
        let error;
        if (currentEditingId) {
            // ATUALIZANDO
            const { error: updateError } = await _supabase
                .from('noticias')
                .update({ titulo: titulo, data: data, resumo: resumo })
                .match({ id: currentEditingId });
            error = updateError;
        
        } else {
            // INSERINDO
            const { error: insertError } = await _supabase
                .from('noticias')
                .insert([{ titulo: titulo, data: data, resumo: resumo }]);
            error = insertError;
        }

        if (error) throw error; 

        // Se deu certo: Reseta o estado
        successMessage.textContent = 'Notícia salva com sucesso!';
        formNoticia.reset(); 
        
        // Limpa o editor TinyMCE
        if (editorInstance) {
            editorInstance.setContent(''); 
        }
        
        currentEditingId = null; 
        carregarNoticiasAdmin(); 

    } catch (error) {
        console.error('Erro ao salvar notícia:', error.message);
        alert('Erro ao salvar: ' + error.message);
    }
});

// --- CARREGAR NOTÍCIAS (Função normal) ---
async function carregarNoticiasAdmin() {
    const listaAdmin = document.getElementById('lista-noticias-admin');
    listaAdmin.innerHTML = '<p>Carregando notícias...</p>';
    const { data: noticias, error } = await _supabase.from('noticias').select('*').order('data', { ascending: false });
    if (error) { listaAdmin.innerHTML = '<p>Erro ao carregar lista.</p>'; return; }
    listaAdmin.innerHTML = ''; 
    noticias.forEach(noticia => {
        const item = document.createElement('div');
        item.className = 'admin-item'; 
        item.innerHTML = `<strong>${noticia.titulo}</strong> (${formatarData(noticia.data)})<div><button class="btn-editar" data-id="${noticia.id}">Editar</button><button class="btn-excluir" data-id="${noticia.id}">Excluir</button></div>`;
        listaAdmin.appendChild(item);
    });
}

// --- EDITAR/EXCLUIR NOTÍCIA (CORRIGIDO por mim) ---
const listaAdmin = document.getElementById('lista-noticias-admin');
listaAdmin.addEventListener('click', async (event) => {
    
    // 1. Lógica de EXCLUIR (Notícia)
    if (event.target.classList.contains('btn-excluir')) {
        if (confirm('Tem certeza que quer excluir esta notícia?')) {
            const idParaExcluir = event.target.dataset.id;
            try {
                const { error } = await _supabase.from('noticias').delete().match({ id: idParaExcluir });
                if (error) throw error;
                carregarNoticiasAdmin(); 
            } catch (error) { alert('Erro ao excluir: ' + error.message); }
        }
    }

    // 2. Lógica de EDITAR (Notícia) - CORRIGIDA
    if (event.target.classList.contains('btn-editar')) {
        const idParaEditar = event.target.dataset.id;
        try {
            const { data: noticia, error } = await _supabase.from('noticias').select('*').match({ id: idParaEditar }).single(); 
            if (error) throw error;

            // --- CORREÇÃO "BABADA" AQUI ---
            const editorInstance = tinymce.get('resumo');
            document.getElementById('titulo').value = noticia.titulo;
            document.getElementById('data').value = noticia.data;
            
            // CHECAGEM DE SEGURANÇA
            if (editorInstance) {
                editorInstance.setContent(noticia.resumo || '');
            } else {
                document.getElementById('resumo').value = noticia.resumo || '';
            }
            // --- FIM DA CORREÇÃO ---
            
            currentEditingId = noticia.id;
            successMessage.textContent = `Editando notícia: "${noticia.titulo}"`;
            window.scrollTo(0, 0); 
        } catch (error) { 
            console.error('Erro ao carregar dados para edição:', error);
            alert('Erro ao carregar dados para edição: ' + error.message); 
        }
    }
});


/* =============================================
   =========== LÓGICA DO CRUD DE EVENTOS =========
   ============================================= */
// (O seu código de Eventos - sem mudanças)
let currentEventEditingId = null;
const formEvento = document.getElementById('form-novo-evento');
const successMessageEvento = document.getElementById('evento-success-message');
const listaAdminEventos = document.getElementById('lista-eventos-admin');
async function carregarEventosAdmin() {
    listaAdminEventos.innerHTML = '<p>Carregando eventos...</p>';
    const { data: eventos, error } = await _supabase.from('eventos').select('*').order('data', { ascending: false });
    if (error) { listaAdminEventos.innerHTML = '<p>Erro ao carregar lista.</p>'; return; }
    listaAdminEventos.innerHTML = ''; 
    eventos.forEach(evento => {
        const item = document.createElement('div');
        item.className = 'admin-item'; 
        item.innerHTML = `<strong>${evento.titulo}</strong> (${formatarData(evento.data)})<div><button class="btn-editar-evento" data-id="${evento.id}">Editar</button><button class="btn-excluir-evento" data-id="${evento.id}">Excluir</button></div>`;
        listaAdminEventos.appendChild(item);
    });
}
formEvento.addEventListener('submit', async (event) => {
    event.preventDefault();
    const titulo = document.getElementById('evento-titulo').value;
    const data = document.getElementById('evento-data').value;
    const local = document.getElementById('evento-local').value;
    successMessageEvento.textContent = '';
    try {
        let error;
        if (currentEventEditingId) {
            const { error: updateError } = await _supabase.from('eventos').update({ titulo: titulo, data: data, local: local }).match({ id: currentEventEditingId });
            error = updateError;
        } else {
            const { error: insertError } = await _supabase.from('eventos').insert([{ titulo: titulo, data: data, local: local }]);
            error = insertError;
        }
        if (error) throw error; 
        successMessageEvento.textContent = 'Evento salvo com sucesso!';
        formEvento.reset(); 
        currentEventEditingId = null; 
        carregarEventosAdmin(); 
    } catch (error) { alert('Erro ao salvar evento: ' + error.message); }
});
listaAdminEventos.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-excluir-evento')) {
        if (confirm('Tem certeza que quer excluir este evento?')) {
            const idParaExcluir = event.target.dataset.id;
            try {
                const { error } = await _supabase.from('eventos').delete().match({ id: idParaExcluir });
                if (error) throw error;
                carregarEventosAdmin(); 
            } catch (error) { alert('Erro ao excluir evento: ' + error.message); }
        }
    }
    if (event.target.classList.contains('btn-editar-evento')) {
        const idParaEditar = event.target.dataset.id;
        try {
            const { data: evento, error } = await _supabase.from('eventos').select('*').match({ id: idParaEditar }).single(); 
            if (error) throw error;
            document.getElementById('evento-titulo').value = evento.titulo;
            document.getElementById('evento-data').value = evento.data;
            document.getElementById('evento-local').value = evento.local;
            currentEventEditingId = evento.id;
            successMessageEvento.textContent = `Editando evento: "${evento.titulo}"`;
            window.scrollTo(0, document.getElementById('admin-eventos').offsetTop); 
        } catch (error) { alert('Erro ao carregar evento para edição: ' + error.message); }
    }
});


/* =============================================
   =========== LÓGICA DO CRUD DE DOCUMENTOS ======
   ============================================= */
// (O seu código de Documentos - sem mudanças)
const formDocumento = document.getElementById('form-novo-documento');
const successMessageDoc = document.getElementById('doc-success-message');
const uploadStatus = document.getElementById('doc-upload-status');
const listaAdminDocumentos = document.getElementById('lista-documentos-admin');
async function carregarDocumentosAdmin() {
    listaAdminDocumentos.innerHTML = '<p>Carregando documentos...</p>';
    const { data: documentos, error } = await _supabase.from('documentos').select('*').order('created_at', { ascending: false });
    if (error) { listaAdminDocumentos.innerHTML = '<p>Erro ao carregar lista.</p>'; return; }
    listaAdminDocumentos.innerHTML = ''; 
    documentos.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'admin-item'; 
        item.innerHTML = `<div><strong>${doc.titulo}</strong><br><small>${doc.descricao || 'Sem descrição'}</small></div><div><button class="btn-excluir-doc" data-id="${doc.id}" data-path="${doc.caminho_storage}">Excluir</button></div>`;
        listaAdminDocumentos.appendChild(item);
    });
}
formDocumento.addEventListener('submit', async (event) => {
    event.preventDefault();
    const titulo = document.getElementById('doc-titulo').value;
    const descricao = document.getElementById('doc-descricao').value;
    const fileInput = document.getElementById('doc-arquivo');
    const file = fileInput.files[0]; 
    if (!file) { alert('Por favor, selecione um arquivo para fazer upload.'); return; }
    const filePath = `public/${Date.now()}_${file.name}`;
    successMessageDoc.textContent = '';
    uploadStatus.textContent = 'Enviando arquivo...';
    try {
        const { data: uploadData, error: uploadError } = await _supabase.storage.from('documentos').upload(filePath, file);
        if (uploadError) throw uploadError;
        uploadStatus.textContent = 'Arquivo enviado! Obtendo URL...';
        const { data: urlData } = _supabase.storage.from('documentos').getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;
        const { error: insertError } = await _supabase.from('documentos').insert({ titulo: titulo, descricao: descricao, caminho_storage: filePath, url_publica: publicUrl });
        if (insertError) throw insertError;
        successMessageDoc.textContent = 'Documento salvo com sucesso!';
        uploadStatus.textContent = '';
        formDocumento.reset(); 
        carregarDocumentosAdmin(); 
    } catch (error) {
        uploadStatus.textContent = '';
        alert('Erro ao salvar documento: ' + error.message);
    }
});
listaAdminDocumentos.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-excluir-doc')) {
        if (confirm('Tem certeza que quer excluir este documento?')) {
            const idParaExcluir = event.target.dataset.id;
            const caminhoParaExcluir = event.target.dataset.path;
            try {
                const { error: storageError } = await _supabase.storage.from('documentos').remove([caminhoParaExcluir]);
                if (storageError) throw storageError;
                const { error: dbError } = await _supabase.from('documentos').delete().match({ id: idParaExcluir });
                if (dbError) throw dbError;
                alert('Documento excluído com sucesso!');
                carregarDocumentosAdmin(); 
            } catch (error) { alert('Erro ao excluir documento: ' + error.message); }
        }
    }
});


/* =============================================
   =========== LÓGICA DE VER DENÚNCIAS =========
   ============================================= */
// (O seu código de Denúncias - sem mudanças)
const listaAdminDenuncias = document.getElementById('lista-denuncias-admin');
async function carregarDenunciasAdmin() {
    listaAdminDenuncias.innerHTML = '<p>Carregando denúncias...</p>';
    const { data: denuncias, error } = await _supabase.from('denuncias').select('*').order('created_at', { ascending: false });
    if (error) { listaAdminDenuncias.innerHTML = '<p>Erro ao carregar lista. Verifique as permissões (RLS).</p>'; return; }
    if (denuncias.length === 0) { listaAdminDenuncias.innerHTML = '<p>Nenhuma denúncia na caixa de entrada.</p>'; return; }
    listaAdminDenuncias.innerHTML = ''; 
    denuncias.forEach(denuncia => {
        const item = document.createElement('div');
        item.className = 'admin-item'; 
        item.innerHTML = `<div><div style="display: flex; justify-content: space-between; align-items: center;"><strong style="font-size: 1.2rem; color: #e74c3c;">Tipo: ${denuncia.tipo}</strong><span style="font-size: 0.9rem; color: #888;">Enviado em: ${dataEnvio}</span></div><p style="margin-top: 10px; white-space: pre-wrap;">${denuncia.descricao}</p></div><div style="text-align: right; margin-top: 10px;"><button class="btn-excluir-denuncia" data-id="${denuncia.id}">Marcar como Resolvido (Excluir)</button></div>`;
        listaAdminDenuncias.appendChild(item);
    });
}
listaAdminDenuncias.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-excluir-denuncia')) {
        if (confirm('Tem certeza que quer excluir esta denúncia? Ela será apagada permanentemente.')) {
            const idParaExcluir = event.target.dataset.id;
            try {
                const { error } = await _supabase.from('denuncias').delete().match({ id: idParaExcluir });
                if (error) throw error;
                alert('Denúncia marcada como resolvida (excluída).');
                carregarDenunciasAdmin(); 
            } catch (error) { alert('Erro ao excluir denúncia: ' + error.message); }
        }
    }
});


/* =============================================
   =========== LÓGICA DA NOVA ABA "EQUIPE" =======
   ============================================= */
// (O seu código da Equipe - sem mudanças)
async function carregarEquipeAdmin() {
    const listaEquipe = document.getElementById('lista-equipe-admin');
    listaEquipe.innerHTML = '<p>Carregando membros...</p>';
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        if (user) {
            listaEquipe.innerHTML = `
                <div class="admin-item">
                    <strong>${user.email}</strong>
                    <span style="color: var(--cor-acento); font-weight: 700;">(Super Admin)</span>
                </div>
            `;
        } else {
            throw new Error('Não foi possível buscar o usuário logado.');
        }
    } catch (error) {
        console.error('Erro ao carregar equipe:', error.message);
        listaEquipe.innerHTML = '<p>Erro ao carregar equipe.</p>';
    }
}


// --- Função helper de data (reutilizável) ---
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}