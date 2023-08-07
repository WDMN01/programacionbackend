import { Router } from "express";
import Cart from "../dao/models/cartModel.js";
import Product from "../dao/models/productModel.js";
import mongoose from "mongoose"; 
const router = Router();


router.post("/carts", async (req, res) => {
  try {
    const newCart = new Cart({
      products: [],
    });

    await newCart.save(); 

    res.status(201).json(newCart);
  } catch (error) {
    console.error("Error al crear nuevo carrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


router.get("/carts/:cid", async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await Cart.findById(cartId).populate("products.product");

    if (!cart) {
      res.status(404).send("Carrito no encontrado");
      return;
    }

    res.json(cart.products);
  } catch (error) {
    console.error("Error al obtener productos del carrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


// ...

router.post("/carts/:cid/productos/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid.trim().replace("\n", ""); 

  console.log("cartId:", cartId);
  console.log("productId:", productId);

  try {
    const cart = await Cart.findById(cartId);

    if (!cart) {
      res.status(404).send("Carrito no encontrado");
      return;
    }

    console.log("cart:", cart);

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send("Producto no encontrado");
      return;
    }

    console.log("product:", product);

    const productInCart = cart.products.find((item) => item.product.equals(productId));

    if (productInCart) {
      productInCart.quantity++;
    } else {
      
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save(); 

    res.json({ message: 'Producto agregado al carrito exitosamente', cart });
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.delete('/carts/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter((product) => !product.product.equals(pid));
    await cart.save();

    res.json({ message: 'Producto eliminado del carrito exitosamente', cart });
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


router.put('/carts/:cid', async (req, res) => {
  const { cid } = req.params;
  const updatedProducts = req.body; 

  try {
    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    cart.products = updatedProducts;

    await cart.save();

    res.json({ message: 'Carrito actualizado exitosamente', cart });
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.put('/carts/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex((product) => product.product.equals(pid));
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.json({ message: 'Cantidad de producto actualizada exitosamente', cart });
  } catch (error) {
    console.error('Error al actualizar cantidad de producto en el carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});



router.delete('/carts/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    cart.products = [];

    await cart.save();

    res.json({ message: 'Carrito vaciado exitosamente' });
  } catch (error) {
    console.error('Error al vaciar el carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});




export default router;