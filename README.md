# 🚀 Portal do Centro Acadêmico (CA)

Plataforma web completa para comunicação e gestão do Centro Acadêmico.
Arquitetura moderna. Painel seguro. Fluxos claros. Tudo em
Jamstack/BaaS.

Site ao vivo: https://portal-ca-omega.vercel.app/

Para testar o painel, clique em **Login Adm** no site. As credenciais
estão no final.

------------------------------------------------------------------------

## 1. ✨ Funcionalidades

O sistema tem duas áreas: Público e Admin.

### 🏛️ Área Pública

Interface responsiva. Acesso rápido às informações.

-   **Notícias:** Lista atualizada em tempo real.
-   **Calendário:** FullCalendar com eventos do Supabase.
-   **Documentos:** Repositório para PDFs e arquivos oficiais.
-   **Denúncias:** Envio anônimo. Sem coleta de IP. Apenas INSERT
    autorizado.

### 🔒 Painel Admin

SPA protegida. Acesso via login.

-   **Login seguro:** Sessão controlada pelo Supabase Auth.
-   **CRUD Notícias:** Criar, editar e excluir.
-   **CRUD Eventos:** Controle total do calendário.
-   **CRUD Documentos:** Upload seguro via Supabase Storage.
-   **Denúncias:** Caixa privada para leitura e exclusão.

------------------------------------------------------------------------

## 2. 🛠️ Arquitetura

Stack moderna e simples.

**Frontend:**\
HTML5\
CSS3 (Flexbox e Grid)\
JavaScript (ES Modules)

**Backend (BaaS):** Supabase\
**Banco:** PostgreSQL\
**Auth:** Supabase Auth\
**Storage:** Supabase Storage\
**Segurança:** Row Level Security (RLS)

Regras: - Público: apenas SELECT nas tabelas e INSERT em denúncias. -
Admin: acesso total.

**Hospedagem:** Vercel (Deploy Contínuo com GitHub)

------------------------------------------------------------------------

## 3. 📁 Estrutura do Projeto

/PORTAL-CA ├── admin.html ├── calendario.html ├── denuncia.html ├──
documentos.html ├── index.html ├── login.html ├── README.md ├──
style.css └── js/ ├── admin.js ├── calendario.js ├── denuncia.js ├──
documentos.js ├── login.js ├── particles-config.js ├── script.js └──
supabaseClient.js

------------------------------------------------------------------------

## 4. ⚙️ Como Rodar Localmente

1.  Clone o repositório.\
2.  Crie um projeto no Supabase.\
3.  No SQL Editor, rode os scripts das tabelas e das regras RLS.\
4.  Vá em **Project Settings \> API** e copie:
    -   URL do projeto\
    -   Chave `anon`\
5.  Cole os valores em `js/supabaseClient.js`.\
6.  Abra no VS Code e execute com Live Server.

------------------------------------------------------------------------

## 5. 🔑 Acesso Admin (somente para apresentação)

**Email:** alevides@gmail.com\
**Senha:** 123456

*Observação:* As credenciais servem apenas para a avaliação. Em
produção, nunca suba senhas no repositório.
