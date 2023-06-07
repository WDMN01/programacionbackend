class ProductManager{
    constructor(){
        this.products =[];
        this.lastId = 0;
    }
    addProduct(producto){
        if (!this.validarObligatorios(producto)) {
            console.log("Error: Todos los campos son obligatorios.");
            return;
        }
        if (this.validarDuplicado(producto.codigo)) {
            console.log("Error: Ya existe un producto con el mismo código.");
            return;
        }
        const id= this.generarId();
        const productoId = {...producto, id};
        this.products.push(productoId);    
    }
    validarObligatorios(producto){
        return(
            producto.nombre && 
            producto.descripcion &&
            producto.precio &&
            producto.imagen &&
            producto.codigo &&
            producto.stock
        );
    }
    validarDuplicado(codigo){
        return this.products.some((producto)=> producto.codigo === codigo);
    }
    generarId(){
        this.lastId++;
        return this.lastId;
    }
    getProductByI(id){
        return this.products.find((producto)=>producto.id === id);
    }
    getproducts() {
        console.log("Lista de productos:");
        this.products.forEach((producto) => {
          console.log(`- ID: ${producto.id}`);
          console.log(`  Nombre: ${producto.nombre}`);
          console.log(`  Descripción: ${producto.descripcion}`);
          console.log(`  Precio: $${producto.precio}`);
          console.log(`  Imagen: ${producto.imagen}`);
          console.log(`  Código: ${producto.codigo}`);
          console.log(`  Stock: ${producto.stock}`);
        });
    }
}

const productManager = new ProductManager();

const producto1 = {
  nombre: "Camiseta",
  descripcion: "Camiseta de algodón",
  precio: 20,
  imagen: "camiseta.jpg",
  codigo: "CAM001",
  stock: 10,
};

const producto2 = {
  nombre: "Pantalón",
  descripcion: "Pantalón de mezclilla",
  precio: 30,
  imagen: "pantalon.jpg",
  codigo: "PAN002",
  stock: 5,
};

productManager.addProduct(producto1);
productManager.addProduct(producto2);
productManager.getproducts();

const productofind = productManager.getProductByI(2);
console.log("Producto encontrado:", productofind);
