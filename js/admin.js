import { _supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificação de Login
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Inicializa TinyMCE (Editor de Texto)
    tinymce.init({
        selector: '#descricao',
        skin: "oxide-dark",
        content_css: "dark",
        height: 200,
        menubar: false
    });

    // 3. Carrega Dados Iniciais
    carregarNoticias();
    carregarEventos();
    carregarDocumentos();
    carregarDenuncias();
    carregarEquipe();

// --- LÓGICA DE UI (INTERFACE) ---
    
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn'); // Novo botão
    
    // Abrir menu
    hamburger.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    // Fechar menu (Botão X)
    if(closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // Fechar ao clicar fora (Opcional, mas bom para UX)
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !hamburger.contains(e.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Navegação entre Seções (Abas) e troca de cor do botão
    const links = document.querySelectorAll('.nav-link'); // Usei a classe nova que pus no HTML
    const sections = document.querySelectorAll('.section');
    const sectionTitle = document.getElementById('section-title');
    const addNewBtn = document.getElementById('add-new-btn');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Remove 'active' de TODOS os links
            links.forEach(l => l.classList.remove('active'));
            
            // 2. Adiciona 'active' SÓ no clicado
            e.target.closest('a').classList.add('active');

            const sectionName = e.target.closest('a').getAttribute('data-section');
            
            // 3. Troca a seção visível
            sections.forEach(sec => sec.classList.remove('active'));
            const activeSection = document.getElementById(sectionName);
            if(activeSection) activeSection.classList.add('active');
            
            // 4. Atualiza Título
            if(sectionTitle) sectionTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
            
            // 5. Lógica do botão "Novo"
            if(sectionName === 'denuncias' || sectionName === 'equipe') {
                if(addNewBtn) addNewBtn.style.display = 'none';
            } else {
                if(addNewBtn) {
                    addNewBtn.style.display = 'block';
                    addNewBtn.setAttribute('data-current-section', sectionName);
                }
            }

            // 6. Fecha o menu sidebar se estiver no celular
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // --- LÓGICA DO MODAL ---
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const editForm = document.getElementById('edit-form');
    const closeModal = document.getElementById('close-modal');

    // Botão "Adicionar Novo"
    addNewBtn.addEventListener('click', () => {
        const section = addNewBtn.getAttribute('data-current-section') || 'noticias';
        abrirModal(section);
    });

    // Botão Fechar Modal
    closeModal.addEventListener('click', () => modal.style.display = 'none');

    // Logout
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await _supabase.auth.signOut();
        window.location.href = 'login.html';
    });

    // --- SALVAR DADOS (SUBMIT) ---
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const section = document.getElementById('current-section').value;
        const id = document.getElementById('edit-id').value;
        
        const titulo = document.getElementById('titulo').value;
        
        let payload = { titulo };

        // Lógica específica por tipo
        if (section === 'noticias') {
            payload.data = document.getElementById('data').value;
            payload.resumo = tinymce.get('descricao').getContent();
        } else if (section === 'eventos') {
            payload.data = document.getElementById('data').value;
            payload.local = document.getElementById('local').value;
        } else if (section === 'documentos') {
            payload.descricao = document.getElementById('descricao').value; // Aqui é texto simples
            // Se for novo e tiver arquivo
            if (!id) {
                const fileInput = document.getElementById('arquivo');
                if(fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const path = `public/${Date.now()}_${file.name}`;
                    await _supabase.storage.from('documentos').upload(path, file);
                    const { data } = _supabase.storage.from('documentos').getPublicUrl(path);
                    payload.caminho_storage = path;
                    payload.url_publica = data.publicUrl;
                }
            }
        }

        try {
            if (id) {
                await _supabase.from(section).update(payload).match({ id });
            } else {
                await _supabase.from(section).insert([payload]);
            }
            
            alert('Salvo com sucesso!');
            modal.style.display = 'none';
            location.reload(); // Recarrega para ver mudanças
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    });
});

// --- FUNÇÕES DE DADOS ---

async function carregarNoticias() {
    const tbody = document.getElementById('tbody-noticias');
    const { data } = await _supabase.from('noticias').select('*').order('data', { ascending: false });
    tbody.innerHTML = data.map(n => `
        <tr>
            <td>${n.id}</td><td>${n.titulo}</td><td>${formatarData(n.data)}</td>
            <td class="actions">
                <button class="edit-btn" onclick='window.preencherModal("noticias", ${JSON.stringify(n)})'>Editar</button>
                <button class="delete-btn" onclick='window.deletarItem("noticias", ${n.id})'>Excluir</button>
            </td>
        </tr>`).join('');
}

async function carregarEventos() {
    const tbody = document.getElementById('tbody-eventos');
    const { data } = await _supabase.from('eventos').select('*');
    tbody.innerHTML = data.map(e => `
        <tr>
            <td>${e.titulo}</td><td>${formatarData(e.data)}</td><td>${e.local || '-'}</td>
            <td class="actions">
                <button class="edit-btn" onclick='window.preencherModal("eventos", ${JSON.stringify(e)})'>Editar</button>
                <button class="delete-btn" onclick='window.deletarItem("eventos", ${e.id})'>Excluir</button>
            </td>
        </tr>`).join('');
}

async function carregarDocumentos() {
    const tbody = document.getElementById('tbody-documentos');
    const { data } = await _supabase.from('documentos').select('*');
    tbody.innerHTML = data.map(d => `
        <tr>
            <td>${d.titulo}</td><td>${d.descricao || '-'}</td><td><a href="${d.url_publica}" target="_blank">Ver</a></td>
            <td class="actions">
                <button class="edit-btn" onclick='window.preencherModal("documentos", ${JSON.stringify(d)})'>Editar</button>
                <button class="delete-btn" onclick='window.deletarItem("documentos", ${d.id})'>Excluir</button>
            </td>
        </tr>`).join('');
}

async function carregarDenuncias() {
    const tbody = document.getElementById('tbody-denuncias');
    const { data } = await _supabase.from('denuncias').select('*');
    tbody.innerHTML = data.map(d => `
        <tr>
            <td>${d.tipo}</td><td>${d.descricao}</td><td>${formatarData(d.created_at)}</td>
            <td class="actions">
                <button class="delete-btn" onclick='window.deletarItem("denuncias", ${d.id})'>Excluir</button>
            </td>
        </tr>`).join('');
}

async function carregarEquipe() {
    const div = document.getElementById('info-equipe');
    const { data: { user } } = await _supabase.auth.getUser();
    div.innerHTML = `<p style="padding:10px">Você está logado como: <strong>${user.email}</strong>. Adicione novos admins pelo painel do Supabase.</p>`;
}

// --- AUXILIARES GLOBAIS ---

window.preencherModal = (section, dados) => {
    const modal = document.getElementById('modal');
    const form = document.getElementById('edit-form');
    
    // Configura campos visíveis
    window.abrirModal(section); 
    
    document.getElementById('modal-title').innerText = 'Editar Item';
    document.getElementById('edit-id').value = dados.id;
    
    document.getElementById('titulo').value = dados.titulo || '';
    if(document.getElementById('data')) document.getElementById('data').value = dados.data || '';
    if(document.getElementById('local')) document.getElementById('local').value = dados.local || '';
    
    // TinyMCE
    if (section === 'noticias' && dados.resumo) {
        tinymce.get('descricao').setContent(dados.resumo);
    } else if (dados.descricao) {
        // Se for documento (textarea normal)
        document.getElementById('descricao').value = dados.descricao; 
    }
}

window.abrirModal = (section) => {
    const modal = document.getElementById('modal');
    const form = document.getElementById('edit-form');
    form.reset();
    if(tinymce.get('descricao')) tinymce.get('descricao').setContent('');
    
    document.getElementById('current-section').value = section;
    document.getElementById('modal-title').innerText = 'Novo Item';
    
    // Mostra/Esconde campos baseado na seção
    document.getElementById('container-data').style.display = (section === 'noticias' || section === 'eventos') ? 'block' : 'none';
    document.getElementById('container-local').style.display = (section === 'eventos') ? 'block' : 'none';
    document.getElementById('container-arquivo').style.display = (section === 'documentos') ? 'block' : 'none';
    
    // TinyMCE só aparece em Notícias
    const editorContainer = document.querySelector('.tox-tinymce');
    const textareaDesc = document.getElementById('descricao');
    
    if (section === 'noticias') {
        if(editorContainer) editorContainer.style.display = 'block';
        textareaDesc.style.display = 'none';
    } else {
        if(editorContainer) editorContainer.style.display = 'none';
        textareaDesc.style.display = 'block';
    }

    modal.style.display = 'flex';
}

window.deletarItem = async (tabela, id) => {
    if(confirm('Tem certeza?')) {
        await _supabase.from(tabela).delete().match({ id });
        location.reload();
    }
}

function formatarData(dataISO) {
    if (!dataISO) return '';
    return new Date(dataISO).toLocaleDateString('pt-BR');
}