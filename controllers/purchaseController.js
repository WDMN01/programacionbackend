// purchaseController.js

import Ticket from '../dao/models/ticketModel.js';
import Cart from '../dao/models/cartModel.js'; // Asegúrate de importar el modelo de carrito adecuado

async function createTicketAndProcessCart(userId) {
  try {
    const userCart = await Cart.findOne({ user: userId }).populate('products.product');

    if (!userCart) {
      return []; // No se pudo encontrar el carrito del usuario
    }

    const productsNotPurchased = [];

    for (const cartProduct of userCart.products) {
      const product = cartProduct.product;

      if (product.stock >= cartProduct.quantity) {
        // ... Lógica para procesar la compra exitosa ...
      } else {
        productsNotPurchased.push(product._id); // Agregar el ID del producto que no se pudo comprar
      }
    }

    if (productsNotPurchased.length === 0) {
      // Todos los productos se compraron con éxito, crear un ticket
      const code = generateUniqueCode();
      const newTicket = new Ticket({
        code,
        amount: userCart.totalAmount, // Asegúrate de que tengas el campo totalAmount en el carrito
        purchaser: userId,
      });

      await newTicket.save();

      // Limpia el carrito, ya que todos los productos se compraron
      userCart.products = [];
      await userCart.save();
    } else {
      // No todos los productos pudieron ser comprados, actualiza el carrito
      userCart.products = userCart.products.filter(cartProduct => {
        return productsNotPurchased.includes(cartProduct.product._id.toString());
      });
      await userCart.save();
    }

    return productsNotPurchased;
  } catch (error) {
    console.error('Error during purchase:', error);
    throw error;
  }
}

export { createTicketAndProcessCart };
