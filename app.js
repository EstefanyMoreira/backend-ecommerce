  const express = require('express'); 
  const cors = require('cors'); // Importar el paquete cors
  const fs = require('fs'); //https://www.w3schools.com/nodejs/nodejs_filesystem.asp, permite interactuar con el sistema de archivos
  const path = require('path'); //https://www.w3schools.com/nodejs/ref_path.asp, trabajar con directorios y rutas de archivos
  const jwt = require('jsonwebtoken'); // Importar jsonwebtoken
  const mysql = require('mysql'); // importar módulo MySQL para manipular la base de datos

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

  // Endpoint POST /cart //
  app.post('/cart', (req, res) => {
    const {Cliente, Productos, Total, Forma_Pago, Estado} = req.body;

    if (!Cliente || !Productos || !Total || !Forma_Pago || !Estado) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // agregar en la tabla Orden_De_Compra una nueva órden //
    const sqlAgregarOrden = `
    INSERT INTO Orden_De_Compra (Orden_Fecha, Id_Cliente, Total, Estado, Forma_Pago)
    VALUES (NOW(), ?, ?, ?, ?) `; //NOW es una función de SQL que permite obtener la hora y fecha exacta del sistema//
    // los signos ´?´ son placeholders, serán remplazados posteriormente por los valores indicados en la consulta //
    
    //ejecutar consulta que agrega una nueva órden //
    db.query(sqlAgregarOrden, [cliente.id, total, estado, forma_pago], (err,result) => {
      if(err){
        console.error('Error al agregar órden:', err.message);
        return res.status(500).json({ message: "Error al guardar órden" });
      }

      // asignamos a ordenId el ID insertado en la consulta anterior// 
      const ordenId = result.insertId;
      
      // creamos un arreglo con información de cada producto de una órden para agregarlo en la base de datos//
      const infoProd = Productos.map(producto => [
        ordenId,
        producto.Id,
        producto.cantidad,
        producto.precio_unitario,
        producto.cantidad * producto.precio_unitario
      ]);

      const sqlAgregarInfo = `
      INSERT INTO Orden_Detalle (Orden_Id, Producto_Id, Cantidad, Precio_Unitario, Subtotal)
      VALUES ? `; // se utiliza un solo placeholder (?) por que en este caso se remplaza el valor con un arreglo//
    
    db.query(sqlAgregarInfo, [infoProd], (err) => {
      if(err){
        console.error('Error al agregar la información:', err.message);
        return res.status(500).json({ message: 'Error al guardar la información de la órden'});
      }
      res.status(201).json({ message: 'Órden guardada con éxito', ordenId });
    });
  });
});

app.listen(port, () => { 
    console.log(`Servidor escuchando en http://localhost:${port}`); 
});