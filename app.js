import express from "express";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { createServer } from 'http';

import {Server} from "socket.io";
import cartRoutes from "./routes/cart_router.js";
import viewrouter from "./routes/view_router.js"
import fs from "fs";
import { Socket } from "dgram";
import { SocketAddress } from "net";
import path from 'path';



const app = express();

app.engine('handlebars', handlebars.engine());


app.use(express.json()); 
app.use("/api", cartRoutes);
app.use("/", viewrouter);

let carts = [];
let productos = [];

app.set('views', path.join(__dirname, 'views'));



app.set('view engine', 'handlebars');
app.use(express.static(__dirname+'/public'));




if (fs.existsSync("carts.json")) {
  const data = fs.readFileSync("carts.json", "utf8");
  carts = JSON.parse(data);
}


if (fs.existsSync("productos.json")) {
  const data = fs.readFileSync("productos.json", "utf8");
  productos = JSON.parse(data);
}


app.post("/carts", (req, res) => {
  const newCart = {
    id: obtenerNuevoId(carts),
    products: [],
  };

  carts.push(newCart);

  fs.writeFile("carts.json", JSON.stringify(carts), (err) => {
    if (err) {
      console.log("Error al escribir en el archivo de carritos:", err);
      res.status(500).send("Error interno del servidor");
      return;
    }

    res.status(201).json(newCart);
  });
});


app.get("/carts/:cid", (req, res) => {
  const cartId = parseInt(req.params.cid);

  const cart = carts.find((cart) => cart.id === cartId);

  if (!cart) {
    res.status(404).send("Carrito no encontrado");
    return;
  }

  const cartProducts = cart.products.map((product) => {
    const cartProduct = productos.find((p) => p.id === product.product);
    return { ...cartProduct, quantity: product.quantity };
  });

  res.json(cartProducts);
});


app.post("/carts/:cid/productos/:pid", (req, res) => {
  const cartId = parseInt(req.params.cid);
  const productId = parseInt(req.params.pid);

  const cart = carts.find((cart) => cart.id === cartId);

  if (!cart) {
    res.status(404).send("Carrito no encontrado");
    return;
  }

  const productIndex = cart.products.findIndex((product) => product.product === productId);

  if (productIndex !== -1) {
    
    cart.products[productIndex].quantity++;
  } else {
    
    const newProduct = {
      product: productId,
      quantity: 1,
    };

    cart.products.push(newProduct);
  }

  fs.writeFile("carts.json", JSON.stringify(carts), (err) => {
    if (err) {
      console.log("Error al escribir en el archivo de carritos:", err);
      res.status(500).send("Error interno del servidor");
      return;
    }

    const cartProducts = cart.products.map((product) => {
      const cartProduct = productos.find((p) => p.id === product.product);
      return { ...cartProduct, quantity: product.quantity };
    });

    res.json(cartProducts);
  });
});


app.post("/productos", (req, res) => {
  const { nombre, descripcion, precio, imagen, codigo, stock } = req.body;

  if (!nombre || !descripcion || !precio || !imagen || !codigo || !stock) {
    res.status(400).send("Todos los campos son obligatorios");
    return;
  }

  const newId = obtenerNuevoId(productos);

  const newProduct = {
    id: newId,
    nombre,
    descripcion,
    precio,
    imagen,
    codigo,
    stock,
  };

  productos.push(newProduct);

  fs.writeFile("productos.json", JSON.stringify(productos), (err) => {
    if (err) {
      console.log("Error al escribir en el archivo de productos:", err);
      res.status(500).send("Error interno del servidor");
      return;
    }

    res.status(201).json(newProduct);
  });

  io.emit("newProduct", nuevoProducto);
  res.status(201).json(nuevoProducto);
});


app.get("/productos", (req, res) => {
  const limit = parseInt(req.query.limit);

  if (limit && limit > 0) {
    const productosLimitados = productos.slice(0, limit);
    res.json(productosLimitados);
  } else {
    res.json(productos);
  }
});


app.get("/productos/:pid", (req, res) => {
  const productId = parseInt(req.params.pid);

  const productoEncontrado = productos.find((producto) => producto.id === productId);

  if (productoEncontrado) {
    res.json(productoEncontrado);
  } else {
    res.status(404).send("Producto no encontrado");
  }
});


app.put("/productos/:pid", (req, res) => {
  const productId = parseInt(req.params.pid);
  const { nombre, descripcion, precio, imagen, codigo, stock } = req.body;

  if (!nombre || !descripcion || !precio || !imagen || !codigo || !stock) {
    res.status(400).send("Todos los campos son obligatorios");
    return;
  }

  const productIndex = productos.findIndex((producto) => producto.id === productId);

  if (productIndex !== -1) {
    const updatedProduct = {
      id: productId,
      nombre,
      descripcion,
      precio,
      imagen,
      codigo,
      stock,
    };

    productos[productIndex] = updatedProduct;

    fs.writeFile("productos.json", JSON.stringify(productos), (err) => {
      if (err) {
        console.log("Error al escribir en el archivo de productos:", err);
        res.status(500).send("Error interno del servidor");
        return;
      }

      res.json(updatedProduct);
    });
  } else {
    res.status(404).send("Producto no encontrado");
  }
});


app.delete("/productos/:pid", (req, res) => {
  const productId = parseInt(req.params.pid);

  const productIndex = productos.findIndex((producto) => producto.id === productId);

  if (productIndex !== -1) {
    productos.splice(productIndex, 1);

    fs.writeFile("productos.json", JSON.stringify(productos), (err) => {
      if (err) {
        console.log("Error al escribir en el archivo de productos:", err);
        res.status(500).send("Error interno del servidor");
        return;
      }

      res.status(204).send();
    });
  } else {
    res.status(404).send("Producto no encontrado");
  }
  io.emit("deleteProduct", productId);

  res.status(204).send();
});

const httpServer = app.listen(8080, () => {
  console.log("Servidor escuchando en el puerto 8080");
});


const io = new Server(httpServer);


io.on("connection", socket => {
  console.log("Nuevo cliente conectado");

  // Escuchamos el evento 'newProduct' cuando se crea un nuevo producto
  socket.on("newProduct", producto => {
    // Enviamos el nuevo producto a todos los clientes conectados
    io.emit("newProduct", producto);
  });

  // Escuchamos el evento 'deleteProduct' cuando se elimina un producto
  socket.on("deleteProduct", productId => {
    // Enviamos el ID del producto eliminado a todos los clientes conectados
    io.emit("deleteProduct", productId);
  });
});


app.get("/realtimeproducts", (req, res) => {
  const isWebSocket = req.headers.upgrade && req.headers.upgrade.toLowerCase() === "websocket";
  
  if (isWebSocket) {
    // Se está utilizando WebSocket
    console.log("WebSocket connection");
  } else {
    // No se está utilizando WebSocket
    console.log("HTTP connection");
  }
  
  // Resto del código de manejo de la solicitud
});


function obtenerNuevoId(items) {
  let newId = 1;
  if (items.length > 0) {
    const ids = items.map((item) => item.id);
    newId = Math.max(...ids) + 1;
  }
  return newId;
}

export { app, io, httpServer };


