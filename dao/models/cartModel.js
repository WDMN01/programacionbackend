import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;
const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", 
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
