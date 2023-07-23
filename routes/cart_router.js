// routes/cart_router.js
import { Router } from "express";
import Cart from "../dao/models/cartModel.js";
import Product from "../dao/models/productModel.js";
import fs from "fs";
import path from "path";

const router = Router();

const cartsFilePath = path.join(process.cwd(), "carts.json");
let carts = [];
if (fs.existsSync(cartsFilePath)) {
  const data = fs.readFileSync(cartsFilePath, "utf8");
  carts = JSON.parse(data);
}

router.post("/carts", async (req, res) => {
  const newCart = new Cart({
    id: obtenerNuevoId(carts),
    products: [],
  });

  await newCart.save();

  res.status(201).json(newCart);
});

router.get("/carts/:cid", async (req, res) => {
  const cartId = parseInt(req.params.cid);

  const cart = await Cart.findOne({ id: cartId }).populate('products.product');

  if (!cart) {
    res.status(404).send("Carrito no encontrado");
    return;
  }

  res.json(cart.products);
});

router.post("/carts/:cid/productos/:pid", async (req, res) => {
  const cartId = parseInt(req.params.cid);
  const productId = req.params.pid;

  const cart = await Cart.findOne({ id: cartId });

  if (!cart) {
    res.status(404).send("Carrito no encontrado");
    return;
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404).send("Producto no encontrado");
    return;
  }

  const productInCart = cart.products.find((p) => p.product.equals(product._id));

  if (productInCart) {
    productInCart.quantity++;
  } else {
    cart.products.push({ product: product._id, quantity: 1 });
  }

  await cart.save();

  res.json(cart.products);
});

// Resto del código que utiliza FileSystem

function obtenerNuevoId(items) {
  let newId = 1;
  if (items.length > 0) {
    const ids = items.map((item) => item.id);
    newId = Math.max(...ids) + 1;
  }
  return newId;
}
export default router;