import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema({
  // No es necesario definir el campo _id, ya que mongoose generará un ObjectId automáticamente.
  nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  precio: {
    type: Number,
    required: true,
  },
  imagen: {
    type: String,
    required: true,
  },
  codigo: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
