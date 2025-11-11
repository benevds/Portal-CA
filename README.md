🚀 Portal do Centro Acadêmico (CA) 🚀

Este não é apenas um site, é uma plataforma web completa e "alto nível" de comunicação e gerenciamento, construída com uma arquitetura moderna (Jamstack/BaaS) para o Centro Acadêmico.

O projeto abandona a comunicação informal e caótica do WhatsApp e a centraliza em um portal dinâmico, responsivo e com um painel de controle 100% funcional para a gestão do CA.

[COLOQUE AQUI UM SCREENSHOT "BABADO" DO SEU HEADER ROXO COM AS PARTÍCULAS EM AÇÃO!]

▶️ Acesso Rápido (Live Demo)

O projeto está 100% funcional e no ar, hospedado no Vercel.

Site Ao Vivo: https://portal-ca-omega.vercel.app/

Para testar o painel de gerenciamento, clique em "Login Adm" no site. As credenciais de teste para a apresentação estão no final deste documento (Seção 5).

1. ✨ Funcionalidades de Luxo (O que foi feito)

O projeto é dividido em duas áreas principais: a Área Pública (para os alunos) e o Painel de Admin (para a gestão).

🏛️ Área Pública (O Site "Abado")

A interface pública é 100% responsiva (funciona em celular) e conta com uma navegação "abada" (multi-página) profissional.

✅ Header Dinâmico "High-Tech": O "desenho foda" que você pediu. Usamos a biblioteca tsParticles para criar um fundo de partículas de rede animadas que reagem ao mouse, dando uma vibe "tech" e "alto nível".

✅ Página de Notícias (index.html): O mural principal, que lê e exibe em tempo real as notícias cadastradas no banco de dados.

✅ Página de Calendário (calendario.html): O calendário "foda". Usamos a FullCalendar.io para exibir um calendário completo que puxa os eventos direto do Supabase.

✅ Página de Documentos (documentos.html): Um repositório onde os alunos podem visualizar e baixar arquivos (PDFs, editais, atas) que a gestão do CA publicou.

✅ Página de Denúncias (denuncia.html): Um canal 100% anônimo para os alunos enviarem denúncias ou sugestões. O sistema não coleta IP, e-mail ou nome, garantindo sigilo total (a RLS só permite INSERT).

🔒 Painel de Admin Seguro (admin.html)

Esta é a área mais complexa do projeto. É uma "Single Page Application" (SPA) protegida.

✅ Rota de Login Protegida: O admin acessa pelo login.html. Se o login for válido, ele é redirecionado para o admin.html. Se você tentar acessar admin.html sem estar logado, o script de segurança te "chuta" de volta para o login.

✅ CRUD Completo de Notícias: O admin pode Criar, Ler, Editar e Excluir notícias.

✅ CRUD Completo de Eventos: O admin pode Criar, Ler, Editar e Excluir eventos (que aparecem no calendário).

✅ CRUD Completo de Documentos: O admin pode fazer Upload de arquivos (PDFs, etc.), Ler e Excluir. O upload é feito com segurança usando o Supabase Storage.

✅ Visualizador de Denúncias: Uma "caixa de entrada" segura onde o admin (e somente o admin) pode ler e excluir as denúncias anônimas enviadas pelo público.

2. 🛠️ Arquitetura e Tecnologias

Este projeto foi construído com uma stack moderna, abandonando o PHP/MySQL (citado no Documento de Visão) em favor de uma arquitetura BaaS (Backend-as-a-Service) muito mais rápida e segura.

Frontend: HTML5, CSS3 (Responsivo com Flexbox/Grid), JavaScript (ES Modules).

Backend (BaaS): Supabase

Banco de Dados: Supabase DB (PostgreSQL).

Autenticação: Supabase Auth (cuida do login e da sessão do admin).

Storage de Arquivos: Supabase Storage (cuida do upload dos documentos).

Segurança: A mágica do projeto. A segurança não está no código, mas no banco. Usamos Row Level Security (RLS) do Supabase para criar regras que dizem:

O público (anon) só pode LER (Select) notícias/eventos/documentos.

O público (anon) só pode CRIAR (Insert) denúncias.

O admin (authenticated) pode fazer TUDO (Select, Insert, Update, Delete) em todas as tabelas.

Hospedagem: Vercel (com Deploy Contínuo integrado ao GitHub).

3. 📁 Estrutura de Pastas

A estrutura foi organizada para ser limpa e profissional, baseada no seu VS Code:

/PORTAL-CA
├── 📄 admin.html           (O Painel de Admin - 4 seções de CRUD)
├── 📄 calendario.html       (Página pública do Calendário)
├── 📄 denuncia.html         (Página pública de Denúncias)
├── 📄 documentos.html        (Página pública de Documentos)
├── 📄 index.html            (Página Principal - Notícias)
├── 📄 login.html            (Página de Login do Admin)
├── 📄 README.md             (Este arquivo "babado")
├── 📄 style.css             (Folha de Estilo principal, roxa e responsiva)
│
└── 📁 js/                   (Pasta de scripts JavaScript)
    ├── 📄 admin.js          (Lógica GIGANTE do painel de admin - 4 CRUDs)
    ├── 📄 calendario.js     (Lógica do FullCalendar)
    ├── 📄 denuncia.js       (Lógica de envio de denúncia)
    ├── 📄 documentos.js     (Lógica de listagem de documentos)
    ├── 📄 login.js          (Lógica de autenticação)
    ├── 📄 particles-config.js (Configuração do "desenho foda")
    ├── 📄 script.js         (Lógica da página principal - Notícias)
    └── 📄 supabaseClient.js (O "coração" - Conexão centralizada)


4. ⚙️ Como Rodar o Projeto Localmente

Clone este repositório.

Crie o Backend no Supabase:

Crie uma conta gratuita no Supabase e crie um novo projeto.

Vá em SQL Editor e rode os scripts SQL que usamos para criar as tabelas (noticias, eventos, documentos, denuncias) e as regras de segurança (RLS).

Configure as Chaves:

No Supabase, vá em Project Settings > API.

Copie sua URL e sua chave anon (public key).

Cole essas duas chaves no arquivo js/supabaseClient.js.

Execute:

Abra o projeto no VS Code e use a extensão Live Server para rodar o index.html.

5. ⚠️⚠️⚠️ ACESSO DE ADMIN (PARA APRESENTAÇÃO) ⚠️⚠️⚠️

Aqui estão as credenciais de acesso ao painel login.html para fins de teste e apresentação.

MUITO IMPORTANTE: Estes dados estão aqui APENAS para a avaliação do projeto. Em um projeto real, você NUNCA deve subir senhas para um repositório! A segurança do banco está na RLS, mas a segurança da conta do admin deve ser protegida.

Email: alevides@gmail.com

Senha: 123456