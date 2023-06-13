import express from "express";
import fs from "fs";

const app = express();

app.get("/saludo", (req, res) => {
  res.send("Mi primer Hola mundo desde backend");
});

app.get("/productos", (req, res) => {
    fs.readFile("productos.json", "utf8", (err, data) => {
      if (err) {
        console.log("Error al leer el archivo de productos:", err);
        res.status(500).send("Error interno del servidor");
      } else {
        const productos = JSON.parse(data);
        const limit = parseInt(req.query.limit); // Obtener el valor de 'limit' y convertirlo a un número entero
  
        if (limit && limit > 0) {
          const productosLimitados = productos.slice(0, limit);
          res.json(productosLimitados);
        } else {
          res.json(productos);
        }
      }
    });
});

app.get("/productos/:pid", (req, res) => {
    const productId = parseInt(req.params.pid);
  
    fs.readFile("productos.json", "utf8", (err, data) => {
      if (err) {
        console.log("Error al leer el archivo de productos:", err);
        res.status(500).send("Error interno del servidor");
      } else {
        const productos = JSON.parse(data);
        const productoEncontrado = productos.find((producto) => producto.id === productId);
  
        if (productoEncontrado) {
          res.json(productoEncontrado);
        } else {
          res.status(404).send("Producto no encontrado");
        }
      }
    });
});


app.listen(4000, () => {
  console.log("Servidor escuchando en el puerto 4000");
});