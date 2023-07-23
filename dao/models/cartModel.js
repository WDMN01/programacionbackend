
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  // Define aquí el esquema para la colección "carts"
  userId: { type: String, required: true },
  products: [{ productId: String, quantity: Number }],
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
