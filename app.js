  const express = require('express'); 
  const cors = require('cors'); // Importar el paquete cors
  const fs = require('fs'); //https://www.w3schools.com/nodejs/nodejs_filesystem.asp, permite interactuar con el sistema de archivos
  const path = require('path'); //https://www.w3schools.com/nodejs/ref_path.asp, trabajar con directorios y rutas de archivos
  const jwt = require('jsonwebtoken'); // Importar jsonwebtoken

  const KEY = "clave" // Llave para firmar los tokens JWT
  const app = express(); 
  const port = 3000; 
  
  app.get("/", (req, res) => {
    res.send("<h1>Bienvenido a mi servidor</h1>");
  });

  // Habilitar CORS para permitir solicitudes desde otros dominios
  app.use(cors());

  // Middleware para analizar cuerpos de solicitudes JSON
  app.use(express.json());

  // Middleware para servir archivos estáticos en la carpeta "data" 
  app.use('/data', express.static(path.join(__dirname, 'data')));

  // Ruta para listar el contenido de una subcarpeta 
  app.get('/data/:folder', (req, res) => { 
    const folder = req.params.folder; 
    const folderPath = path.join(__dirname, 'data', folder); 
    
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
    const filePath = path.join(__dirname, 'data', folder, filename);

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

// Ruta para login: valida credenciales y genera un token JWT si son correctas
app.post('/login', (req, res) => {
  const {username, password} = req.body; // Extraer username y password del cuerpo de la solicitud

  // Validar usuario y contraseña
  if (username === "admin" && password === "admin") {
    const token = jwt.sign({username}, KEY); // Genera un token JWT con la llave KEY
    res.status(200).json({token}); // Enviar el token en la respuesta
  } else {
    res.status(401).json({message: "usuario y/o contraseña incorrecto"});
  }
});

app.listen(port, () => { 
    console.log(`Servidor escuchando en http://localhost:${port}`); 
});