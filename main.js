import { writeFileSync, readFile } from "fs";

class ProductManager{
    constructor(path){
        this.path =path;
        this.products =[];
        this.lastId = 0;
        this.cargaProductos();
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
        this.guardarProductos();   
    }

    actualizarProducto(id, datosActualizados) {
      const producto = this.getProductByI(id);
      if (!producto) {
        console.log("Error: No se encontró el producto.");
        return;
      }
  
      Object.assign(producto, datosActualizados);
      this.guardarProductos();
      console.log("Producto actualizado correctamente.");
    }
    //------------------------
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
    eliminarProducto(id) {
        this.products = this.products.filter((producto) => producto.id !== id);
        this.guardarProductos();
        console.log("PRODUCTO ELIMINADO")
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
    guardarProductos() {
        try {
          writeFileSync(this.path, JSON.stringify(this.products), "utf8");
          console.log(`Productos guardados en: ${this.path}`);
        } catch (err) {
          console.log("Error al guardar los productos:", err);
        }
    }
    cargaProductos() {
        readFile(this.path, "utf8", (err, data) => {
          if (err) {
            console.log("Error al cargar los productos:", err);
          } else {
            try {
              this.products = JSON.parse(data);
              console.log(`Productos cargados desde: ${this.path}`);
              this.actualizarLastId();
            } catch (error) {
              console.log("Error al analizar los datos del archivo:", error);
            }
          }
        });
    }
    actualizarLastId() {
        if (this.products.length > 0) {
          const maxId = Math.max(...this.products.map((producto) => producto.id));
          this.lastId = maxId;
        }
      }

}

const productManager = new ProductManager("productos.json");

const producto1 = {
  nombre: "Audifonos",
  descripcion: "Audifonos Sony",
  precio: 250000,
  imagen: "AUSONY.jpg",
  codigo: "SNQ122",
  stock: 5,
};

const producto2 = {
  nombre: "Samsung S22",
  descripcion: "Telefono Samsung S22",
  precio: 4200000,
  imagen: "s22.jpg",
  codigo: "SPSS23",
  stock: 15,
};

productManager.addProduct(producto1);
productManager.addProduct(producto2);
productManager.getproducts();

const productofind = productManager.getProductByI(2);
console.log("Producto encontrado:", productofind);
productManager.getproducts();
productManager.actualizarProducto(2, {
  nombre: "Samsung S21",
  precio: 5000000,
  stock: 8,
});
productManager.getproducts();