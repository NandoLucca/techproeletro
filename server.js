const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// TROCA A SENHA AQUI
const ADMIN_PASSWORD = "techpro2026";

app.use(express.static(__dirname));
app.use(express.json());

// Rota principal
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// Rota de login CORRETA pro admin.html
app.post("/admin/login", (req, res) => {
  const { senha } = req.body; // ← agora pega "senha" e não "password"
  
  if (senha === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Senha incorreta" });
  }
});

// Rota pra listar produtos no painel
app.get("/api/produtos", (req, res) => {
  // Por enquanto retorna os 2 produtos fixos
  res.json([
    { nome: "Echo Dot 5ª Geração", preco: "299.00", img: "https://m.media-amazon.com/images/I/61u0y9W4jCL._AC_SL1000_.jpg" },
    { nome: "Samsung Galaxy A15", preco: "999.00", img: "https://m.media-amazon.com/images/I/61L5QgP7iAL._AC_SL1500_.jpg" }
  ]);
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));