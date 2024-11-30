  const express = require('express'); 
  const cors = require('cors'); // Importar el paquete cors
  const fs = require('fs'); //https://www.w3schools.com/nodejs/nodejs_filesystem.asp, permite interactuar con el sistema de archivos
  const path = require('path'); //https://www.w3schools.com/nodejs/ref_path.asp, trabajar con directorios y rutas de archivos
  const jwt = require('jsonwebtoken'); // Importar jsonwebtoken
  const mysql = require('mysql2'); // importar módulo MySQL para manipular la base de datos

  const KEY = "clave" // Llave para firmar los tokens JWT
  const app = express(); 
  const port = 3000; 
  
  // conexión a la base de datos //

  const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_ecommerce',
  });

  db.connect((error) => {
    if (error) {
      console.error('Error:', error);
      throw error;
    }
    console.log('Conectado a la base de datos');
  });

  app.get("/", (req, res) => {
    res.send("<h1>Bienvenido a mi servidor</h1>");
  });

  // Habilitar CORS para permitir solicitudes desde otros dominios
  app.use(cors());

  // Middleware para analizar cuerpos de solicitudes JSON
  app.use(express.json());


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


// Agregar un middleware de autorizacion para el token que se pedira para todas las rutas data

app.use("/data", (req, res, next) => {
  try {
    const decoded = jwt.verify(req.headers["access-key"], KEY);
    console.log(decoded);
    next(); // Agregado para continuar con el siguiente middleware o ruta
  } catch (err) {
    res.status(401).json({ message: "usuario no autorizado" });
  }
});


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

// endpoint /CART

app.post('/cart', (req, res) => {
  const { productos } = req.body;
  const token = req.headers["access-key"]; //se pide el token para extraerle el valor "username" 
 
  if (!token) {
   return res.status(401).json({ message: "Token no proporcionado" });
 }

 try {
   const decoded = jwt.verify(token, KEY);
   const username = decoded.username; //se extrae "username" para insertarlo posteriormente en la tabla "Carrito"

   db.beginTransaction((err) => {
    if (err) {
     return res.status(500).json({ error: 'Error al iniciar la transacción' });
    }

 const carritoQuery = `
   INSERT INTO Carrito (username, Articulos)
   VALUES (?, ?)`
   ;

   db.query(carritoQuery, [username, JSON.stringify(productos)], (err, result) => {
       if (err) {
         return db.rollback(() => {
           res.status(500).json({ error: `Error al insertar datos en tabla Carrito` });
         });
       }

   const carritoId = result.insertId;

   //extraemos del array userCart que se envió en el fetch, los valores de los productos que se encuentran en el carrito para insertarlos en la tabla "Producto"

   const productosValores = productos.map((producto) => [
     producto.productId,
     producto.name,
     producto.cost,
     producto.currency,
     producto.count,
   ]);

   // Insertamos los productos en la tabla Producto
   const productosQuery = `
     INSERT INTO Producto (Product_Id, Nombre, Descripción, Costo, Moneda, Cantidad_Vendidos)
     VALUES ?
   `;
   
   db.query(productosQuery, [productosValores], (err) => {
     if (err) {
       return db.rollback(() => {
         res.status(500).json({ error: 'Error al insertar productos en la tabla Producto' });
       });
     }

   db.commit(err => {
   if (err) {
     return db.rollback(() => {
       res.status(500).json({ error: `Error al confirmar la transacción` });
     });
   }

       res.json({ message: `Compra realizada con éxito`, carritoId });
       });
     });
   });
 });

} catch (err) {
 res.status(401).json({ message: "Token inválido o expirado" });
}
});

app.listen(port, () => { 
    console.log(`Servidor escuchando en http://localhost:${port}`); 
});