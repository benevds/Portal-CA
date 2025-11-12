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
    
    // AQUI! Carrega TODAS as quatro seções
    carregarNoticiasAdmin();
    carregarEventosAdmin();
    carregarDocumentosAdmin();
    carregarDenunciasAdmin(); // <-- ADICIONADO!
});


// --- PASSO 2: FUNCIONALIDADE DE LOGOUT ---
const btnLogout = document.getElementById('btn-logout');
btnLogout.addEventListener('click', async () => {
    const { error } = await _supabase.auth.signOut();
    if (error) {
        console.error('Erro ao sair:', error.message);
    } else {
        alert('Você saiu da sua conta.');
        window.location.href = 'index.html';
    }
});


/* =============================================
   =========== LÓGICA DO CRUD DE NOTÍCIAS ========
   ============================================= */

// --- PASSO 3: CADASTRAR E ATUALIZAR NOTÍCIA (INTELIGENTE) ---
const formNoticia = document.getElementById('form-nova-noticia');
const successMessage = document.getElementById('success-message');

formNoticia.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    const titulo = document.getElementById('titulo').value;
    const data = document.getElementById('data').value;
    const resumo = document.getElementById('resumo').value;
    successMessage.textContent = ''; 

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

        successMessage.textContent = 'Notícia salva com sucesso!';
        formNoticia.reset(); 
        currentEditingId = null; 
        carregarNoticiasAdmin(); 
    } catch (error) {
        console.error('Erro ao salvar notícia:', error.message);
        alert('Erro ao salvar: ' + error.message);
    }
});


// --- PASSO 4: CARREGAR NOTÍCIAS (para a lista de gerenciamento) ---
async function carregarNoticiasAdmin() {
    const listaAdmin = document.getElementById('lista-noticias-admin');
    listaAdmin.innerHTML = '<p>Carregando notícias...</p>';

    const { data: noticias, error } = await _supabase
        .from('noticias')
        .select('*')
        .order('data', { ascending: false });

    if (error) {
        console.error('Erro ao carregar lista admin:', error.message);
        listaAdmin.innerHTML = '<p>Erro ao carregar lista.</p>';
        return;
    }

    listaAdmin.innerHTML = ''; 
    noticias.forEach(noticia => {
        const item = document.createElement('div');
        item.className = 'admin-item'; 
        item.innerHTML = `
            <strong>${noticia.titulo}</strong> (${formatarData(noticia.data)})
            <div style="float: right;">
                <button class="btn-editar" data-id="${noticia.id}">Editar</button>
                <button class="btn-excluir" data-id="${noticia.id}">Excluir</button>
            </div>
        `;
        listaAdmin.appendChild(item);
    });
}


// --- PASSO 5: ESCUTADOR GLOBAL PARA DELETAR/EDITAR (NOTÍCIAS) ---
const listaAdmin = document.getElementById('lista-noticias-admin');

listaAdmin.addEventListener('click', async (event) => {
    
    // 1. Lógica de EXCLUIR (Notícia)
    if (event.target.classList.contains('btn-excluir')) {
        if (confirm('Tem certeza que quer excluir esta notícia?')) {
            const idParaExcluir = event.target.dataset.id;
            try {
                const { error } = await _supabase
                    .from('noticias')
                    .delete()
                    .match({ id: idParaExcluir });
                if (error) throw error;
                carregarNoticiasAdmin(); 
            } catch (error) {
                alert('Erro ao excluir: ' + error.message);
            }
        }
    }

    // 2. Lógica de EDITAR (Notícia)
    if (event.target.classList.contains('btn-editar')) {
        const idParaEditar = event.target.dataset.id;
        try {
            const { data: noticia, error } = await _supabase
                .from('noticias')
                .select('*')
                .match({ id: idParaEditar })
                .single(); 
            
            if (error) throw error;

            document.getElementById('titulo').value = noticia.titulo;
            document.getElementById('data').value = noticia.data;
            document.getElementById('resumo').value = noticia.resumo;
            currentEditingId = noticia.id;
            successMessage.textContent = `Editando notícia: "${noticia.titulo}"`;
            window.scrollTo(0, 0); 
        } catch (error) {
            alert('Erro ao carregar dados para edição: ' + error.message);
        }
    }
});


// Função helper de data (reutilizável)
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}

/* =============================================
   =========== LÓGICA DO CRUD DE EVENTOS =========
   ============================================= */

// --- Variável de estado para Eventos ---
let currentEventEditingId = null;

// --- Seletores dos novos elementos ---
const formEvento = document.getElementById('form-novo-evento');
const successMessageEvento = document.getElementById('evento-success-message');
const listaAdminEventos = document.getElementById('lista-eventos-admin');

// --- PASSO 1: Carregar os eventos na lista de gerenciamento ---
async function carregarEventosAdmin() {
    listaAdminEventos.innerHTML = '<p>Carregando eventos...</p>';

    const { data: eventos, error } = await _supabase
        .from('eventos')
        .select('*')
        .order('data', { ascending: false });

    if (error) {
        console.error('Erro ao carregar lista de eventos:', error.message);
        listaAdminEventos.innerHTML = '<p>Erro ao carregar lista.</p>';
        return;
    }

    listaAdminEventos.innerHTML = ''; 
    eventos.forEach(evento => {
        const item = document.createElement('div');
        item.className = 'admin-item'; 
        item.innerHTML = `
            <strong>${evento.titulo}</strong> (${formatarData(evento.data)})
            <div style="float: right;">
                <button class="btn-editar-evento" data-id="${evento.id}">Editar</button>
                <button class="btn-excluir-evento" data-id="${evento.id}">Excluir</button>
            </div>
        `;
        listaAdminEventos.appendChild(item);
    });
}

// --- PASSO 2: Fazer o formulário salvar (Create e Update) ---
formEvento.addEventListener('submit', async (event) => {
    event.preventDefault();

    const titulo = document.getElementById('evento-titulo').value;
    const data = document.getElementById('evento-data').value;
    const local = document.getElementById('evento-local').value;
    successMessageEvento.textContent = '';

    try {
        let error;
        if (currentEventEditingId) {
            // ATUALIZAR
            const { error: updateError } = await _supabase
                .from('eventos')
                .update({ titulo: titulo, data: data, local: local })
                .match({ id: currentEventEditingId });
            error = updateError;
        } else {
            // CRIAR
            const { error: insertError } = await _supabase
                .from('eventos')
                .insert([{ titulo: titulo, data: data, local: local }]);
            error = insertError;
        }
        if (error) throw error; 

        successMessageEvento.textContent = 'Evento salvo com sucesso!';
        formEvento.reset(); 
        currentEventEditingId = null; 
        carregarEventosAdmin(); 
    } catch (error) {
        console.error('Erro ao salvar evento:', error.message);
        alert('Erro ao salvar evento: ' + error.message);
    }
});

// --- PASSO 3: Fazer os botões de Editar e Excluir funcionarem ---
listaAdminEventos.addEventListener('click', async (event) => {
    
    // Lógica de EXCLUIR
    if (event.target.classList.contains('btn-excluir-evento')) {
        if (confirm('Tem certeza que quer excluir este evento?')) {
            const idParaExcluir = event.target.dataset.id;
            try {
                const { error } = await _supabase
                    .from('eventos')
                    .delete()
                    .match({ id: idParaExcluir });
                if (error) throw error;
                carregarEventosAdmin(); 
            } catch (error) {
                alert('Erro ao excluir evento: ' + error.message);
            }
        }
    }

    // Lógica de EDITAR
    if (event.target.classList.contains('btn-editar-evento')) {
        const idParaEditar = event.target.dataset.id;
        try {
            const { data: evento, error } = await _supabase
                .from('eventos')
                .select('*')
                .match({ id: idParaEditar })
                .single(); 
            
            if (error) throw error;

            document.getElementById('evento-titulo').value = evento.titulo;
            document.getElementById('evento-data').value = evento.data;
            document.getElementById('evento-local').value = evento.local;
            currentEventEditingId = evento.id;
            successMessageEvento.textContent = `Editando evento: "${evento.titulo}"`;
            window.scrollTo(0, document.getElementById('admin-eventos').offsetTop); 
        } catch (error) {
            alert('Erro ao carregar evento para edição: ' + error.message);
        }
    }
});


/* =============================================
   =========== LÓGICA DO CRUD DE DOCUMENTOS ======
   ============================================= */

// --- Seletores dos novos elementos ---
const formDocumento = document.getElementById('form-novo-documento');
const successMessageDoc = document.getElementById('doc-success-message');
const uploadStatus = document.getElementById('doc-upload-status');
const listaAdminDocumentos = document.getElementById('lista-documentos-admin');

// --- PASSO 1: Carregar os documentos na lista ---
async function carregarDocumentosAdmin() {
    listaAdminDocumentos.innerHTML = '<p>Carregando documentos...</p>';

    const { data: documentos, error } = await _supabase
        .from('documentos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao carregar lista de documentos:', error.message);
        listaAdminDocumentos.innerHTML = '<p>Erro ao carregar lista.</p>';
        return;
    }

    listaAdminDocumentos.innerHTML = ''; 
    documentos.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'admin-item'; 
        item.innerHTML = `
            <div>
                <strong>${doc.titulo}</strong><br>
                <small>${doc.descricao || 'Sem descrição'}</small>
            </div>
            <div style="float: right;">
                <button class="btn-excluir-doc" data-id="${doc.id}" data-path="${doc.caminho_storage}">Excluir</button>
            </div>
        `;
        listaAdminDocumentos.appendChild(item);
    });
}

// --- PASSO 2: Fazer o formulário salvar (Upload + Save) ---
formDocumento.addEventListener('submit', async (event) => {
    event.preventDefault();

    const titulo = document.getElementById('doc-titulo').value;
    const descricao = document.getElementById('doc-descricao').value;
    const fileInput = document.getElementById('doc-arquivo');
    const file = fileInput.files[0]; 

    if (!file) {
        alert('Por favor, selecione um arquivo para fazer upload.');
        return;
    }

    const filePath = `public/${Date.now()}_${file.name}`;
    successMessageDoc.textContent = '';
    uploadStatus.textContent = 'Enviando arquivo...';

    try {
        // 1. FAZ O UPLOAD para o Supabase Storage
        const { data: uploadData, error: uploadError } = await _supabase.storage
            .from('documentos') // Nome do Balde (Bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        uploadStatus.textContent = 'Arquivo enviado! Obtendo URL...';

        // 2. PEGA A URL PÚBLICA
        const { data: urlData } = _supabase.storage
            .from('documentos')
            .getPublicUrl(filePath);
        
        const publicUrl = urlData.publicUrl;

        // 3. SALVA AS INFORMAÇÕES na tabela SQL 'documentos'
        const { error: insertError } = await _supabase
            .from('documentos')
            .insert({
                titulo: titulo,
                descricao: descricao,
                caminho_storage: filePath,
                url_publica: publicUrl
            });

        if (insertError) throw insertError;

        successMessageDoc.textContent = 'Documento salvo com sucesso!';
        uploadStatus.textContent = '';
        formDocumento.reset(); 
        carregarDocumentosAdmin(); 

    } catch (error) {
        console.error('Erro ao salvar documento:', error.message);
        uploadStatus.textContent = '';
        alert('Erro ao salvar documento: ' + error.message);
    }
});

// --- PASSO 3: Fazer o botão de Excluir funcionar (Dupla Exclusão) ---
listaAdminDocumentos.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-excluir-doc')) {
        if (confirm('Tem certeza que quer excluir este documento?')) {
            
            const idParaExcluir = event.target.dataset.id;
            const caminhoParaExcluir = event.target.dataset.path;

            try {
                // 1. DELETA O ARQUIVO do Storage
                const { error: storageError } = await _supabase.storage
                    .from('documentos')
                    .remove([caminhoParaExcluir]);
                
                if (storageError) throw storageError;

                // 2. DELETA A LINHA do Banco de Dados
                const { error: dbError } = await _supabase
                    .from('documentos')
                    .delete()
                    .match({ id: idParaExcluir });

                if (dbError) throw dbError;

                alert('Documento excluído com sucesso!');
                carregarDocumentosAdmin(); 
            
            } catch (error) {
                alert('Erro ao excluir documento: ' + error.message);
            }
        }
    }
});

/* =============================================
   =========== LÓGICA DE VER DENÚNCIAS =========
   =========== (CÓDIGO NOVO ADICIONADO) ==========
   ============================================= */

// --- Seletores dos novos elementos ---
const listaAdminDenuncias = document.getElementById('lista-denuncias-admin');

// --- PASSO 1: Carregar as denúncias na lista ---
async function carregarDenunciasAdmin() {
    listaAdminDenuncias.innerHTML = '<p>Carregando denúncias...</p>';

    const { data: denuncias, error } = await _supabase
        .from('denuncias')
        .select('*')
        .order('created_at', { ascending: false }); // Mais recentes primeiro

    if (error) {
        console.error('Erro ao carregar lista de denúncias:', error.message);
        listaAdminDenuncias.innerHTML = '<p>Erro ao carregar lista. Verifique as permissões (RLS).</p>';
        return;
    }

    if (denuncias.length === 0) {
        listaAdminDenuncias.innerHTML = '<p>Nenhuma denúncia na caixa de entrada.</p>';
        return;
    }

    listaAdminDenuncias.innerHTML = ''; // Limpa o "carregando"
    
    denuncias.forEach(denuncia => {
        const item = document.createElement('div');
        item.className = 'admin-item'; // Reutilizando o estilo
        item.style.borderLeft = '5px solid #e74c3c'; // Destaque vermelho
        item.style.marginTop = '15px';
        item.style.padding = '15px';
        item.style.background = '#fffafa';

        // Formata a data de envio
        const dataEnvio = new Date(denuncia.created_at).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        });

        item.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 1.2rem; color: #c0392b;">Tipo: ${denuncia.tipo}</strong>
                    <span style="font-size: 0.9rem; color: #555;">Enviado em: ${dataEnvio}</span>
                </div>
                <p style="margin-top: 10px; white-space: pre-wrap;">${denuncia.descricao}</p>
            </div>
            <div style="text-align: right; margin-top: 10px;">
                <button class="btn-excluir-denuncia" data-id="${denuncia.id}">Marcar como Resolvido (Excluir)</button>
            </div>
        `;
        listaAdminDenuncias.appendChild(item);
    });
}

// --- PASSO 2: Fazer o botão de Excluir funcionar ---
listaAdminDenuncias.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-excluir-denuncia')) {
        if (confirm('Tem certeza que quer excluir esta denúncia? Ela será apagada permanentemente.')) {
            
            const idParaExcluir = event.target.dataset.id;

            try {
                // 1. DELETA A DENÚNCIA do Banco de Dados
                const { error } = await _supabase
                    .from('denuncias')
                    .delete()
                    .match({ id: idParaExcluir });

                if (error) throw error;

                alert('Denúncia marcada como resolvida (excluída).');
                carregarDenunciasAdmin(); // Recarrega a lista
            
            } catch (error) {
                alert('Erro ao excluir denúncia: ' + error.message);
            }
        }
    }
});