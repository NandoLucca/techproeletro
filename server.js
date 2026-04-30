const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Senha do admin - TROCA AQUI
const ADMIN_PASSWORD = "Fhl330282@";

app.use(express.static(__dirname));
app.use(express.json()); // Pra ler senha do POST

// Rota principal
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// Rota de login do admin
app.post("/login", (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Senha incorreta" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));