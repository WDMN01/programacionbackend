import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema({
  
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },   // Campo requerido 'stock'
  codigo: { type: String, required: true },  // Campo requerido 'codigo'
  imagen: { type: String, required: true },
  owner: {
    type: String, 
    default: 'admin',
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
