// Importa a conexão PRONTA do nosso arquivo central
import { _supabase } from './supabaseClient.js';

// Variável para guardar o ID do item que estamos editando
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
    carregarNoticiasAdmin();
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


// --- PASSO 3: CADASTRAR E ATUALIZAR NOTÍCIA (INTELIGENTE) ---
const formNoticia = document.getElementById('form-nova-noticia');
const successMessage = document.getElementById('success-message');

formNoticia.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede recarregar a página

    // Pega os valores do formulário
    const titulo = document.getElementById('titulo').value;
    const data = document.getElementById('data').value;
    const resumo = document.getElementById('resumo').value;
    successMessage.textContent = ''; // Limpa mensagens

    try {
        let error;

        // SE currentEditingId NÃO for nulo, estamos ATUALIZANDO
        if (currentEditingId) {
            const { error: updateError } = await _supabase
                .from('noticias')
                .update({ titulo: titulo, data: data, resumo: resumo })
                .match({ id: currentEditingId });
            error = updateError;
        
        // SE NÃO, estamos INSERINDO um novo
        } else {
            const { error: insertError } = await _supabase
                .from('noticias')
                .insert([{ titulo: titulo, data: data, resumo: resumo }]);
            error = insertError;
        }
        
        if (error) throw error; // Joga para o "catch"

        // Se deu certo
        successMessage.textContent = 'Notícia salva com sucesso!';
        formNoticia.reset(); // Limpa o formulário
        currentEditingId = null; // Limpa o ID de edição
        carregarNoticiasAdmin(); // Atualiza a lista

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

    listaAdmin.innerHTML = ''; // Limpa o "carregando"
    noticias.forEach(noticia => {
        const item = document.createElement('div');
        item.className = 'admin-item'; // Você pode estilizar isso no style.css
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


// --- PASSO 5: ESCUTADOR GLOBAL PARA DELETAR/EDITAR ---
const listaAdmin = document.getElementById('lista-noticias-admin');

listaAdmin.addEventListener('click', async (event) => {
    
    // 1. Lógica de EXCLUIR
    if (event.target.classList.contains('btn-excluir')) {
        if (confirm('Tem certeza que quer excluir esta notícia?')) {
            const idParaExcluir = event.target.dataset.id;
            try {
                const { error } = await _supabase
                    .from('noticias')
                    .delete()
                    .match({ id: idParaExcluir });
                if (error) throw error;
                carregarNoticiasAdmin(); // Recarrega a lista
            } catch (error) {
                alert('Erro ao excluir: ' + error.message);
            }
        }
    }

    // 2. Lógica de EDITAR (AGORA FUNCIONA!)
    if (event.target.classList.contains('btn-editar')) {
        const idParaEditar = event.target.dataset.id;
        
        try {
            // Busca os dados COMPLETOS da notícia que queremos editar
            const { data: noticia, error } = await _supabase
                .from('noticias')
                .select('*')
                .match({ id: idParaEditar })
                .single(); // Pega só um
            
            if (error) throw error;

            // Preenche o formulário lá em cima com os dados
            document.getElementById('titulo').value = noticia.titulo;
            document.getElementById('data').value = noticia.data;
            document.getElementById('resumo').value = noticia.resumo;
            
            // Guarda o ID que estamos editando
            currentEditingId = noticia.id;
            
            // Avisa o usuário e rola para o topo
            successMessage.textContent = `Editando notícia: "${noticia.titulo}"`;
            window.scrollTo(0, 0); 

        } catch (error) {
            alert('Erro ao carregar dados para edição: ' + error.message);
        }
    }
});


// Função helper de data
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
}