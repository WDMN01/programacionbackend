import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs';
import { io } from "../app.js";
import Message from "../app.js";
import Product from '../dao/models/productModel.js';
import Cart from '../dao/models/cartModel.js'; 

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
router.get('/realtimeproducts', async (req, res) => {
  try {
    // Obtener los productos de la base de datos
    const products = await Product.find();

    // Configurar el evento de conexión del cliente WebSocket
    io.on("connection", socket => {
      console.log("Nuevo cliente conectado a la vista de productos en tiempo real");

      // Emitir los productos al cliente conectado
      socket.emit("productos", products);
    });

    res.render('layouts/realTimeProducts', { products });
  } catch (error) {
    console.error('Error al obtener productos desde la base de datos:', error);
    res.status(500).send('Error interno del servidor');
  }
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

router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const sortOrder = sort === 'desc' ? -1 : 1;
    const searchQuery = query ? { categoria: query } : {};

    const totalProducts = await Product.countDocuments(searchQuery);
    const skip = (page - 1) * limit;
    const products = await Product.find(searchQuery)
      .sort({ precio: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const totalPages = Math.ceil(totalProducts / limit);

    res.render('layouts/products', {
      products: products.map(product => ({
        _id: product._id,
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        cartId: '64c0be9764940b2a6dcfe013' // Reemplaza con el ID del carrito real
      })),
      currentPage: page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      sort,
      query,
    });
  } catch (error) {
    console.error('Error al obtener productos desde la base de datos:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});


router.get('/products/:pid', async (req, res) => {
  const productId = req.params.pid;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send('Producto no encontrado');
      return;
    }

    res.render('layouts/productDetails', { 
      product: {
        _id: product._id,
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        // Asegúrate de agregar otros campos del producto que necesites en la vista
      }
    });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/api/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await Cart.findById(cartId).populate('products.product');

    if (!cart) {
      res.status(404).send('Carrito no encontrado');
      return;
    }

    res.render('layouts/cart', { cart });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});



export default router;
