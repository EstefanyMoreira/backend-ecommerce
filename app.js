  const express = require('express'); 
  const fs = require('fs'); //https://www.w3schools.com/nodejs/nodejs_filesystem.asp, permite interactuar con el sistema de archivos
  const path = require('path'); //https://www.w3schools.com/nodejs/ref_path.asp, trabajar con directorios y rutas de archivos
  const app = express(); 
  const port = 3000; 
  
  app.get("/", (req, res) => {
  
    res.send("<h1>Bienvenido a mi servidor</h1>");
  });

  // Middleware para servir archivos estáticos en la carpeta "data.json" 
  app.use('/data', express.static(path.join(__dirname, 'data.json')));

  // Ruta para listar el contenido de una subcarpeta 
  app.get('/data/:folder', (req, res) => { 
    const folder = req.params.folder; 
    const folderPath = path.join(__dirname, 'data.json', folder); 
    
    fs.readdir(folderPath, (err, files) => { 
        if (err) {  
            res.status(404).send('Carpeta no encontrada'); 
            return; 
        } res.json({ files }); 
    }); 
});

  // Ruta para obtener un archivo JSON específico desde cualquier subcarpeta 
  app.get('/data/:folder/:filename', (req, res) => { 
    const folder = req.params.folder; 
    const filename = req.params.filename; 
    const filePath = path.join(__dirname, 'data.json', folder, filename);

    console.log(`Intentando acceder al archivo: ${filePath}`); // Log para depuración

    fs.readFile(filePath, 'utf8', (err, data) => { 
        if (err) { 
            console.error(`Error leyendo el archivo: ${err.message}`);  
            res.status(404).send('Archivo no encontrado'); 
            return; 
        }  
        res.json(JSON.parse(data)); 
    }); 
});

app.listen(port, () => { 
    console.log(`Servidor escuchando en http://localhost:${port}`); 
});