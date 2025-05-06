const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Função de validação de senha forte
function senhaEhForte(senha) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!&*])[A-Za-z\d@#$%!&*]{8,}$/;
  return regex.test(senha);
}

// Rota de cadastro
app.post('/cadastro', async (req, res) => {
  const { email, username, password } = req.body;

  if (!senhaEhForte(password)) {
    return res.json({
      success: false,
      message: 'A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, minúscula, número e símbolo.'
    });
  }

  try {
    // Verificar se o email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.json({ success: false, message: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir novo usuário
    const { error } = await supabase
      .from('users')
      .insert([
        { email, username, password: hashedPassword, is_admin: false }
      ]);

    if (error) throw error;

    req.session.username = username;
    req.session.isAdmin = false;
    res.json({ success: true });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.json({ success: false, message: 'Erro ao cadastrar.' });
  }
});

// Rota de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`);

    if (error || !users || users.length === 0) {
      return res.json({ success: false, message: 'Usuário ou e-mail não encontrado.' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ success: false, message: 'Senha incorreta.' });
    }

    req.session.username = user.username;
    req.session.isAdmin = !!user.is_admin;

    res.json({
      success: true,
      redirect: user.is_admin ? '/admin.html' : '/index.html'
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.json({ success: false, message: 'Erro ao fazer login.' });
  }
});

// Sessão
app.get('/session-info', (req, res) => {
  res.json({
    loggedIn: !!req.session.username,
    username: req.session.username,
    isAdmin: req.session.isAdmin
  });
});

// Adicionar conteúdo
app.post('/add-conteudo', async (req, res) => {
  const { cover, title, release, duration, type, description } = req.body;
  const nomeCompleto = `${title} (${release})`;

  try {
    const { error } = await supabase
      .from('conteudo')
      .insert([
        {
          capa: cover,
          nome: nomeCompleto,
          data_lancamento: release,
          duracao: duration,
          tipo: type,
          description: description
        }
      ]);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao adicionar conteúdo:', error);
    res.json({ success: false, message: 'Erro ao adicionar conteúdo.' });
  }
});

// Editar conteúdo
app.post('/edit-conteudo/:id', async (req, res) => {
  const id = req.params.id;
  const { cover, title, release, duration, type, description } = req.body;
  const nomeCompleto = `${title} (${release})`;

  try {
    const { error } = await supabase
      .from('conteudo')
      .update({
        capa: cover,
        nome: nomeCompleto,
        data_lancamento: release,
        duracao: duration,
        tipo: type,
        description: description
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao editar conteúdo:', error);
    res.json({ success: false, message: 'Erro ao editar conteúdo.' });
  }
});

// Obter conteúdo por ID
app.get('/conteudo/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { data, error } = await supabase
      .from('conteudo')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao buscar conteúdo.' });
  }
});

// Listar conteúdo
app.get('/conteudo', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conteudo')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erro ao listar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao buscar conteúdo.' });
  }
});

// Deletar conteúdo
app.delete('/delete-conteudo/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { error } = await supabase
      .from('conteudo')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error);
    res.json({ success: false, message: 'Erro ao apagar conteúdo.' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
