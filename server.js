const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET todos os produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('criado_em', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Erro GET /api/produtos:', error);
    res.status(500).json({ erro: error.message });
  }
});

// POST criar produto
app.post('/api/produtos', async (req, res) => {
  try {
    const { nome, preco, img, linkAmazon, linkShopee, link, categoria, destaque } = req.body;
    
    if (!linkAmazon && !linkShopee && !link) {
      return res.status(400).json({ erro: 'Informe pelo menos um link: Amazon ou Shopee' });
    }
    
    const { data, error } = await supabase
      .from('produtos')
      .insert([{
        nome,
        preco,
        img,
        linkAmazon: linkAmazon || null,
        linkShopee: linkShopee || null,
        link: link || null,
        categoria: categoria || 'Geral',
        destaque: destaque || false
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erro Supabase INSERT:', error);
      throw error;
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Erro POST /api/produtos:', error);
    res.status(500).json({ erro: error.message });
  }
});

// PUT editar produto
app.put('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, img, linkAmazon, linkShopee, link, categoria, destaque } = req.body;
    
    if (!linkAmazon && !linkShopee && !link) {
      return res.status(400).json({ erro: 'Informe pelo menos um link: Amazon ou Shopee' });
    }
    
    const { data, error } = await supabase
      .from('produtos')
      .update({
        nome,
        preco,
        img,
        linkAmazon: linkAmazon || null,
        linkShopee: linkShopee || null,
        link: link || null,
        categoria: categoria || 'Geral',
        destaque: destaque || false
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erro PUT /api/produtos:', error);
    res.status(500).json({ erro: error.message });
  }
});

// DELETE produto
app.delete('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Erro DELETE /api/produtos:', error);
    res.status(500).json({ erro: error.message });
  }
});

// RENDER PRECISA DISSO AQUI
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});