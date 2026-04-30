const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// TROCA A SENHA AQUI
const ADMIN_PASSWORD = "techpro2026";

app.use(express.static(__dirname));
app.use(express.json()); // Isso aqui é obrigatório pro login

// Rota principal
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// Rota que o admin.html chama pra logar
app.post("/login", (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Senha incorreta" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));