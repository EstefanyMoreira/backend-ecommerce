/* Comandos para crear base de datos */

CREATE DATABASE db_ecommerce; /*creamos la base de datos*/
USE db_ecommerce;

/*Creamos primero las tablas que no tienen claves foráneas, es decir, que son independientes*/

CREATE TABLE Cliente (
    Id_Cliente INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(20),
    Segundo_Nombre VARCHAR(20),
    Apellido VARCHAR(20),
    Segundo_Apellido VARCHAR(20),
    Email VARCHAR(20),
    Teléfono INT
);

CREATE TABLE Categorias (
    Categoria_Id INT PRIMARY KEY AUTO_INCREMENT,
    Nombre_Categoria VARCHAR(20)
);

/*Creamos las tablas con claves foráneas que referencian a las dos primeras tablas*/

CREATE TABLE Productos (
    Producto_Id INT PRIMARY KEY AUTO_INCREMENT,
    Nombre_Producto VARCHAR(20),
    Categoria_Id INT,
    Precio DECIMAL(10,2),
    Cantidad_Disponible INT,
    Descripción TEXT,
    FOREIGN KEY (Categoria_Id) REFERENCES Categorias(Categoria_Id)
);

CREATE TABLE Orden_De_Compra (
    Orden_Id INT PRIMARY KEY AUTO_INCREMENT,
    Orden_Fecha DATE,
    Id_Cliente INT,
    Total DECIMAL(10,2),
    Estado VARCHAR(20),
    Forma_Pago VARCHAR(20),
    FOREIGN KEY (Id_Cliente) REFERENCES Cliente(Id_Cliente)
);

/* Creamos las tablas que dependen de varias tablas */

CREATE TABLE Orden_Detalle (
    Detalle_Id INT PRIMARY KEY AUTO_INCREMENT,
    Orden_Id INT,
    Producto_Id INT,
    Cantidad INT,
    Precio_Unitario DECIMAL(10,2),
    Subtotal DECIMAL(10,2),
    FOREIGN KEY (Orden_Id) REFERENCES Orden_De_Compra(Orden_Id),
    FOREIGN KEY (Producto_Id) REFERENCES Productos(Producto_Id)
);

CREATE TABLE Entrega (
    Id_Entrega INT PRIMARY KEY AUTO_INCREMENT,
    Tipo VARCHAR(20),
    `Status` VARCHAR(20),
    Fecha_Entrega DATE,
    Orden_Id INT,
    Departamento_Entrega VARCHAR(20),
    Localidad_Entrega VARCHAR(20),
    Calle_Entrega VARCHAR(20),
    Número_Entrega INT,
    Esquina_Entrega VARCHAR(20),
    FOREIGN KEY (Orden_Id) REFERENCES Orden_De_Compra(Orden_Id)
);