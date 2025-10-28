const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the Vue app
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', (req, res) => res.send('¡Hola, mundo desde Docker!'));

// Handles any requests that don't match the ones above
app.get('/*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.listen(port, () => console.log(`Servidor escuchando en http://localhost:${port}`));
