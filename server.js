const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = "techpro2026";
const PRODUTOS_FILE = "./produtos.json";

app.use(express.static("public"));
app.use(express.json());

function carregarProdutos() {
  try {
    return JSON.parse(fs.readFileSync(PRODUTOS_FILE));
  } catch {
    return [
      { id: 1, nome: "Echo Dot 5ª Geração", preco: "299.00", img: "https://m.media-amazon.com/images/I/71xoR4A6q-L._AC_SL1000_.jpg", link: "https://amzn.to/seulink1" },
      { id: 2, nome: "Samsung Galaxy A15", preco: "999.00", img: "https://m.media-amazon.com/images/I/51Vh4p4xj-L._AC_SL1000_.jpg", link: "https://amzn.to/seulink2" }
    ];
  }
}

function salvarProdutos(produtos) {
  fs.writeFileSync(PRODUTOS_FILE, JSON.stringify(produtos, null, 2));
}

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

app.post("/admin/login", (req, res) => {
  const { senha } = req.body;
  if (senha === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

app.get("/api/produtos", (req, res) => {
  res.json(carregarProdutos());
});

app.post("/api/produtos", (req, res) => {
  const produtos = carregarProdutos();
  const novoProduto = { id: Date.now(),...req.body };
  produtos.push(novoProduto);
  salvarProdutos(produtos);
  res.json({ success: true, produto: novoProduto });
});

// NOVA ROTA: Deletar produto
app.delete("/api/produtos/:id", (req, res) => {
  let produtos = carregarProdutos();
  produtos = produtos.filter(p => p.id!= req.params.id);
  salvarProdutos(produtos);
  res.json({ success: true });
});

// NOVA ROTA: Editar produto
app.put("/api/produtos/:id", (req, res) => {
  let produtos = carregarProdutos();
  const index = produtos.findIndex(p => p.id == req.params.id);
  if (index!== -1) {
    produtos[index] = {...produtos[index],...req.body };
    salvarProdutos(produtos);
    res.json({ success: true, produto: produtos[index] });
  } else {
    res.status(404).json({ success: false });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));