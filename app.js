import express from "express";
import handlebars from "express-handlebars";
import path from "path";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import cartRoutes from "./routes/cart_router.js";
import viewrouter from "./routes/view_router.js";
import Product from "./dao/models/productModel.js";
import { v4 as uuidv4 } from "uuid";
import __dirname from "./utils.js";


const MONGODB_URI =
  "mongodb+srv://coder:1234@cluster0.veee94b.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conexión a MongoDB exitosa");
    cargarProductosIniciales();
  })
  .catch((error) => {
    console.error("Error al conectar a MongoDB:", error);
  });

const app = express();

let currentProductId = 0;
function obtenerNuevoId() {
  return currentProductId++;
}

app.engine("handlebars", handlebars.engine());

app.use(express.json());
app.use("/api", cartRoutes);
app.use("/", viewrouter);

app.set("views", path.join(__dirname, "views"));


app.set("view engine", "handlebars");
app.use(express.static(__dirname+'/public'));


let carts = [];
let productos = [];

app.post("/carts", (req, res) => {
  const newCart = {
    id: obtenerNuevoId(carts),
    products: [],
  };

  carts.push(newCart);

  res.status(201).json(newCart);
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

  res.json(cart.products);
});

// ...

app.post("/productos", async (req, res) => {
  const { nombre, descripcion, precio, imagen, codigo, stock } = req.body;

  if (!nombre || !descripcion || !precio || !imagen || !codigo || !stock) {
    res.status(400).send("Todos los campos son obligatorios");
    return;
  }

  try {
    const newProduct = new Product({
      _id: obtenerNuevoId(),
      nombre,
      descripcion,
      precio,
      imagen,
      codigo,
      stock,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error al guardar el producto en la base de datos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// ...


app.get("/productos", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);

    let productos;
    if (limit && limit > 0) {
      productos = await Product.find().limit(limit);
    } else {
      productos = await Product.find();
    }

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos desde la base de datos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Resto de las rutas relacionadas con productos y carritos utilizando los modelos de Mongoose

// Función para cargar productos iniciales desde FileSystem
async function cargarProductosIniciales() {
  // Puedes agregar aquí la lógica para cargar los productos iniciales desde FileSystem si lo deseas
}


const httpServer = createServer(app);
const io = new Server(httpServer);

// Escuchamos el evento de conexión del cliente WebSocket
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Emitir eventos personalizados a los clientes conectados

  // Escuchamos el evento 'newProduct' cuando se crea un nuevo producto
  socket.on("newProduct", (producto) => {
    // Enviamos el nuevo producto a todos los clientes conectados
    io.emit("newProduct", producto);
  });

  // Escuchamos el evento 'deleteProduct' cuando se elimina un producto
  socket.on("deleteProduct", (productId) => {
    // Enviamos el ID del producto eliminado a todos los clientes conectados
    io.emit("deleteProduct", productId);
  });
});

app.get("/productos/:pid", async (req, res) => {
  const productId = parseInt(req.params.pid);

  try {
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      res.status(404).send("Producto no encontrado");
      return;
    }

    res.json(product);
  } catch (error) {
    console.error("Error al obtener el producto desde la base de datos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.put("/productos/:pid", async (req, res) => {
  const productId = req.params.pid;
  const { nombre, descripcion, precio, imagen, codigo, stock } = req.body;

  try {
    // Verificar si el producto con el ID dado existe en la base de datos
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send("Producto no encontrado");
      return;
    }

    // Actualizar los campos del producto con los valores recibidos en el body de la solicitud
    product.nombre = nombre;
    product.descripcion = descripcion;
    product.precio = precio;
    product.imagen = imagen;
    product.codigo = codigo;
    product.stock = stock;

    // Guardar el producto actualizado en la base de datos
    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar el producto en la base de datos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.delete("/productos/:pid", async (req, res) => {
  const productId = req.params.pid;

  try {
    // Verificar si el producto con el ID dado existe en la base de datos
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send("Producto no encontrado");
      return;
    }

    // Eliminar el producto de la base de datos
    await Product.deleteOne({ _id: productId });

    res.send("Producto eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar el producto de la base de datos:", error);
    res.status(500).send("Error interno del servidor");
  }
});


// Ruta para mostrar la vista del chat


// Escuchamos el evento 'message' cuando se recibe un nuevo mensaje desde el cliente
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Escuchamos el evento 'message' cuando se recibe un nuevo mensaje desde el cliente
  socket.on("message", async (data) => {
    try {
      // Guardar el nuevo mensaje en la colección "messages" de MongoDB
      await Message.create({ user: data.user, message: data.message });

      // Emitir el mensaje a todos los clientes conectados para que se muestre en el chat
      io.emit('message', data);
    } catch (error) {
      console.error("Error al guardar el mensaje en la base de datos:", error);
    }
  });

  
});


const messageSchema = new mongoose.Schema({
  user: String,
  message: String
});

const Message = mongoose.model("Message", messageSchema);

export default Message;

httpServer.listen(8080, () => {
  console.log("Servidor escuchando en el puerto 8080");
});


export { app, io, httpServer };
