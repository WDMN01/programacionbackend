
import Cart from '../models/cartModel.js';


export async function createCart(userId) {
  const newCart = new Cart({ userId, products: [] });
  return newCart.save();
}

export async function getCart(cartId) {
  return Cart.findById(cartId).exec();
}

