/* Comandos para crear base de datos */

CREATE DATABASE db_ecommerce; /*creamos la base de datos*/
USE db_ecommerce;

/*Creamos primero las tablas que no tienen claves foráneas, es decir, que son independientes*/

CREATE TABLE Usuario (
 username VARCHAR(20) PRIMARY KEY,
 Nombre VARCHAR(20),
 Segundo_Nombre VARCHAR(20),
 Apellido VARCHAR(20),
 Segundo_Apellido VARCHAR(20),
 Email VARCHAR(20),
 Teléfono INT,
 Imagen_De_Perfil VARCHAR(250)
);

CREATE TABLE Categoria (
 CatID INT PRIMARY KEY AUTO_INCREMENT,
 Nombre VARCHAR(20),
 Descripción TEXT,
 Cantidad INT
);

CREATE TABLE Producto (
 Product_Id INT PRIMARY KEY,
 Nombre VARCHAR(20),
 Descripción TEXT,
 Costo DECIMAL(10,2),
 Moneda CHAR(3),
 Cantidad_Vendidos INT DEFAULT 0,
 Imagenes VARCHAR(250)
);

/* Creamos las tablas que dependen de otras tablas */

CREATE TABLE carrito (
    user_ID VARCHAR(255) NOT NULL,
    productName VARCHAR(255) NOT NULL,
    productPrice DECIMAL(10, 2) NOT NULL,
    productCount INT NOT NULL
);

CREATE TABLE Comentario (
 ID_Comentario INT PRIMARY KEY AUTO_INCREMENT,
 username VARCHAR(20),
 Product_Id INT,
 Comentario VARCHAR(50),
 Calificacion INT CHECK (Calificacion BETWEEN 1 AND 5),
 Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (username) REFERENCES Usuario(username),
 FOREIGN KEY (Product_Id) REFERENCES Producto(Product_Id)
);