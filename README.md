# Front 30'

Sistema de gestão de equipe para supervisora de operações — rotina diária de liderança,
indicadores do time, desenvolvimento de pessoas e melhorias, tudo em um só lugar.

**Fase atual:** protótipo funcional em React (Vite), com login por e-mail e senha via
Firebase Authentication. Os dados de indicadores, colaboradores, feedbacks etc. ainda
são fictícios e vivem só no front-end (a persistência real é a próxima fase).

---

## 1. Rodar localmente

Pré-requisitos: Node.js 18+ e npm.

```bash
npm install
cp .env.example .env   # depois preencha com as chaves do seu projeto Firebase (passo 2)
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## 2. Configurar o Firebase (autenticação por e-mail e senha)

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto (ou use um existente).
2. No menu lateral, vá em **Build > Authentication > Sign-in method** e ative o provedor **E-mail/senha**.
3. Vá em **Configurações do projeto (ícone de engrenagem) > Geral**, role até "Seus apps" e crie um **app da Web** (ícone `</>`). Não precisa marcar Firebase Hosting.
4. O Firebase vai te mostrar um objeto `firebaseConfig` parecido com este:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto",
     storageBucket: "seu-projeto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
   };
   ```

5. Copie cada valor para o arquivo `.env` (baseado no `.env.example`):

   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

6. Pronto — rode `npm run dev` de novo. Na tela de login, use "Criar conta" para cadastrar
   o primeiro usuário (e-mail + senha), ou crie usuários manualmente em
   **Authentication > Users > Add user** no console do Firebase.

> O `.env` nunca deve ir para o GitHub — ele já está no `.gitignore`.

## 3. Subir para o GitHub

```bash
git init
git add .
git commit -m "Front 30' — protótipo com login Firebase"
git branch -M main
git remote add origin <url-do-seu-repositorio>
git push -u origin main
```

(Se você for usar o Antigravity para fazer isso, é só apontar para esta pasta — ela já
está pronta, com `.gitignore` cobrindo `node_modules` e `.env`.)

## 4. Deploy na Vercel

1. Em [vercel.com](https://vercel.com), clique em **Add New > Project** e importe o repositório do GitHub.
2. A Vercel detecta automaticamente que é um projeto Vite (`npm run build`, saída em `dist`). Não precisa mexer em nada aqui.
3. Antes de concluir o deploy (ou depois, em **Settings > Environment Variables**), adicione as mesmas 6 variáveis do `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Clique em **Deploy**.
5. **Importante:** depois do primeiro deploy, volte ao Firebase Console em
   **Authentication > Settings > Authorized domains** e adicione o domínio que a Vercel
   te deu (ex.: `front30.vercel.app`). Sem isso, o login funciona no `localhost` mas é
   bloqueado em produção.

## Estrutura do projeto

```
front30/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── src/
│   ├── main.jsx              # ponto de entrada, envolve o app com AuthProvider
│   ├── App.jsx                # as 7 telas do sistema (Início, Meu Time, Rotina...)
│   ├── index.css               # identidade visual (laranja / creme / lilás)
│   ├── firebase.js             # inicialização do Firebase a partir das env vars
│   ├── context/
│   │   └── AuthContext.jsx     # estado de login, entrar/cadastrar/sair/redefinir senha
│   └── components/
│       ├── Login.jsx           # tela de entrar / criar conta / esqueci a senha
│       └── RequireAuth.jsx     # só mostra o app se houver usuário autenticado
```

## O que ainda é fase 2 (não incluído aqui)

- Persistência real dos dados (indicadores, feedbacks, melhorias etc.) — hoje eles
  resetam ao recarregar a página, pois vivem em memória no front-end.
- Papéis e permissões reais ligados ao login (hoje existe um seletor "Perfil de
  demonstração" na barra lateral só para simular a visão de gestora vs. colaborador).
- Conexão da análise de IA ("Analisar minha semana") a dados reais — hoje ela é
  gerada a partir dos dados fictícios do protótipo.
- Uso de dados reais de colaboradores, que só deve acontecer após validação com as
  políticas e ferramentas autorizadas pela empresa.
