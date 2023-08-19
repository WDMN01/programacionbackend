import express from "express";
import exphbs from 'express-handlebars';
import handlebars from "express-handlebars";
import path from "path";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import cartRoutes from "./routes/cart_router.js";
import viewrouter from "./routes/view_router.js";
import Product from "./dao/models/productModel.js";
import { v4 as uuidv4 } from "uuid"
import { fileURLToPath } from "url";
import { dirname } from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
import bcrypt from "bcrypt";
import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from './dao/models/userModel.js';
import flash from 'connect-flash';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import { Strategy as GitHubStrategy } from 'passport-github2'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const MONGODB_URI =
  "mongodb+srv://coder:1234@cluster0.rym7s8w.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conexión a MongoDB exitosa");
    cargarProductosIniciales();
  })
  .catch((error) => {
    console.error("Error al conectar a MongoDB:", error);
  });

  const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    } else {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
  };
  
  const isUser = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'usuario') {
      return next();
    } else {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
  };

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }), 
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
const hbs = exphbs.create({
  handlebars: allowInsecurePrototypeAccess(handlebars)
});
let currentProductId = 0;
function obtenerNuevoId() {
  return uuidv4();
}

app.engine("handlebars", handlebars.engine());


app.use("/api", cartRoutes);
app.use("/", viewrouter);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");
app.use(express.static(__dirname+'/public'));


let carts = [];
let productos = [];
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'Incorrect email' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return done(null, false, { message: 'Incorrect password' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});


passport.use(new GitHubStrategy({
  clientID: "Iv1.526e323e475e8396",
  clientSecret: "8f55810432c91516bcf74ad52afc9283d1ef79b4",
  callbackURL: 'http://localhost:8080/api/sessions/githubcallback', 
}, async (accessToken, refreshToken, profile, done) => {
  try {
   
    const user = await User.findOne({ githubId: profile.id });
    if (user) {
      return done(null, user);
    }
    
    const newUser = new User({
      githubId: profile.id,
    
    });
    await newUser.save();
    return done(null, newUser);

    
    done(null, user); 
    done(null, false); 

  } catch (error) {
    done(error); 
  }
}));

app.get('/api/sessions/githubcallback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    
    res.redirect('/products');
  }
);



app.post("/productos", isAdmin, async (req, res) => {
  const { nombre, descripcion, precio, imagen, stock } = req.body;

  if (!nombre || !descripcion || !precio || !imagen || !stock) {
    res.status(400).send("Todos los campos son obligatorios");
    return;
  }

  try {
    const newProduct = new Product({
      nombre,
      descripcion,
      precio,
      imagen,
      stock,
    });


    newProduct.codigo = uuidv4();

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error al guardar el producto en la base de datos:", error);
    res.status(500).send("Error interno del servidor");
  }
});



app.get("/productos", async (req, res) => {
  try {
    
    const { limit = 10, page = 1, sort, query } = req.query;
    const sortOrder = sort === "desc" ? -1 : 1;

    
    const searchQuery = query ? { categoria: query } : {};

    
    const totalProducts = await Product.countDocuments(searchQuery);

    
    const skip = (page - 1) * limit;

    
    const productos = await Product.find(searchQuery)
      .sort({ precio: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    
    const totalPages = Math.ceil(totalProducts / limit);

    
    const response = {
      status: "success",
      payload: productos,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page: Number(page),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/productos?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
      nextLink: page < totalPages ? `/productos?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error al obtener productos desde la base de datos:", error);
    res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
});



async function cargarProductosIniciales() {
  
}


const httpServer = createServer(app);
const io = new Server(httpServer);


io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  
  socket.on("newProduct", (producto) => {
   
    io.emit("newProduct", producto);
  });

  
  socket.on("deleteProduct", (productId) => {
    
    io.emit("deleteProduct", productId);
  });
});

app.get("/productos/:pid", async (req, res) => {
  const productId = req.params.pid;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send("Producto no encontrado");
      return;
    }

    res.json(product);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.put("/productos/:pid", isAdmin, async (req, res) => {
  const productId = req.params.pid;
  const { nombre, descripcion, precio, imagen, codigo, stock } = req.body;

  try {
    
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send("Producto no encontrado");
      return;
    }

    
    product.nombre = nombre;
    product.descripcion = descripcion;
    product.precio = precio;
    product.imagen = imagen;
    product.codigo = codigo;
    product.stock = stock;

    
    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar el producto en la base de datos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.delete("/productos/:pid", isAdmin, async (req, res) => {
  const productId = req.params.pid;

  try {
    
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send("Producto no encontrado");
      return;
    }

    
    await Product.deleteOne({ _id: productId });

    res.send("Producto eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar el producto de la base de datos:", error);
    res.status(500).send("Error interno del servidor");
  }
});



io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("message", async (data) => {
    try {
     
      await Message.create({ user: data.user, message: data.message });

      io.emit('message', data);
    } catch (error) {
      console.error("Error al guardar el mensaje en la base de datos:", error);
    }
  });

  
});



const messageSchema = new mongoose.Schema({
  user: String,
  message: String
});

const Message = mongoose.model("Message", messageSchema);

export default Message;

httpServer.listen(8080, () => {
  console.log("Servidor escuchando en el puerto 8080");
});
export { app, io, httpServer };
