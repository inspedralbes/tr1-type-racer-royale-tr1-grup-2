const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();


// --- Configuración de CORS ---
const corsOptions = {
  origin: 'http://localhost:4000' 
};
app.use(cors(corsOptions));

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Servidor escuchando en http://localhost:${port}`));
