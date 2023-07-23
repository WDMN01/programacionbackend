import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs';
import { io } from "../app.js";
import Message from "../app.js";
 

const router = Router();



// Obtener la ruta del directorio actual
const currentDir = dirname(fileURLToPath(import.meta.url));

router.get('/home', (req, res) => {
  const productosPath = join(currentDir, '..',  'productos.json');

  readFile(productosPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al leer el archivo de productos.');
    }

    const productos = JSON.parse(data);
    res.render('layouts/home', { productos });
  });
});

//--------------------
router.get('/realtimeproducts', (req, res) => {
  const productosPath = join(currentDir, '..', 'productos.json');

  readFile(productosPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al leer el archivo de productos.');
    }

    const productos = JSON.parse(data);
    
    // Configurar el evento de conexión del cliente WebSocket
    io.on("connection", socket => {
      console.log("Nuevo cliente conectado a la vista de productos en tiempo real");

      // Emitir los productos al cliente conectado
      socket.emit("productos", productos);
    });

    res.render('layouts/realTimeProducts', { productos });
  });
});

router.get("/chat", async (req, res) => {
  try {
    // Obtener los mensajes almacenados en la colección "messages" de MongoDB
    const messages = await Message.find();
    res.render('layouts/chat', { messages });
    
  } catch (error) {
    console.error("Error al obtener los mensajes:", error);
    res.status(500).send("Error interno del servidor");
  }
});





export default router;
