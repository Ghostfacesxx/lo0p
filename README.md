# Backend Loop

Este é o backend do projeto Loop, uma aplicação de streaming de filmes e séries.

## Tecnologias Utilizadas

- Node.js
- Express
- Supabase (Banco de dados)
- Netlify (Deploy)

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/backend-loop.git
cd backend-loop
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
SESSION_SECRET=sua_chave_secreta
NODE_ENV=development
```

4. Configure o banco de dados:
- Acesse o painel do Supabase
- Execute o script SQL do arquivo `supabase_schema.sql` no editor SQL do Supabase

## Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Deploy no Netlify

1. Crie uma conta no Netlify
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente no painel do Netlify
4. O deploy será feito automaticamente quando houver push na branch main

## Estrutura do Projeto

```
backend-loop/
├── functions/
│   └── api.js           # Função serverless para o Netlify
├── public/              # Arquivos estáticos
├── .env                 # Variáveis de ambiente
├── netlify.toml         # Configuração do Netlify
├── package.json         # Dependências e scripts
├── server.js           # Servidor Express
└── supabase_schema.sql # Schema do banco de dados
```

## API Endpoints

### Autenticação
- POST `/api/cadastro` - Cadastro de usuário
- POST `/api/login` - Login de usuário
- GET `/api/session-info` - Informações da sessão

### Conteúdo
- GET `/api/conteudo` - Lista todo o conteúdo
- GET `/api/conteudo/:id` - Obtém conteúdo específico
- POST `/api/add-conteudo` - Adiciona novo conteúdo
- POST `/api/edit-conteudo/:id` - Edita conteúdo existente
- DELETE `/api/delete-conteudo/:id` - Remove conteúdo

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request 