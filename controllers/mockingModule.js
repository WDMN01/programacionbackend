import express from 'express';
const router = express.Router();

router.get('/mockingproducts', (req, res) => {
  const mockProducts = [];
  for (let i = 1; i <= 100; i++) {
    mockProducts.push({
      _id: i,
      nombre: `Producto ${i}`,
      descripcion: `Descripción del Producto ${i}`,
      precio: Math.random() * 100,
      stock: Math.floor(Math.random() * 50) + 1
    });
  }
  res.json(mockProducts);
});

export default router;
