import {Router} from "express";
import fs from "fs";
const router = Router();


let carts = [];
let productos = [];

if (fs.existsSync("carts.json")) {
  const data = fs.readFileSync("carts.json", "utf8");
  carts = JSON.parse(data);
}


if (fs.existsSync("productos.json")) {
  const data = fs.readFileSync("productos.json", "utf8");
  productos = JSON.parse(data);
}

router.post("/carts", (req, res) => {
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


router.get("/carts/:cid", (req, res) => {
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


router.post("/carts/:cid/productos/:pid", (req, res) => {
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
function obtenerNuevoId(items) {
  let newId = 1;
  if (items.length > 0) {
    const ids = items.map((item) => item.id);
    newId = Math.max(...ids) + 1;
  }
  return newId;
}
export default router;