import mongoose from "mongoose";
const { Schema } = mongoose;
import Cart from "./cartModel.js";
const { ObjectId } = mongoose.Types;

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  age: Number,
  password: String,
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role: {
    type: String,
    enum: ['usuario', 'admin', 'premium'], 
    default: 'usuario',
  },
  documents: [
    {
        name: String,
        reference: String,
    }
],
last_connection: Date,
});

const User = mongoose.model("User", userSchema);

export default User;