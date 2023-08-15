import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs';
import { io } from "../app.js";
import Message from "../app.js";
import Product from '../dao/models/productModel.js';
import Cart from '../dao/models/cartModel.js'; 
import User from '../dao/models/userModel.js';
import express from 'express';
import bcrypt from 'bcrypt';
import handlebars from 'handlebars';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import exphbs from 'express-handlebars';
import passport from 'passport';
import LocalStrategy from 'passport-local';

const router = Router();

handlebars.registerHelper('ifEqual', function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

const hbs = exphbs.create({
  handlebars: allowInsecurePrototypeAccess(handlebars)
});

const currentDir = dirname(fileURLToPath(import.meta.url));

const checkLogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login'); 
  }
  next(); 
};


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



passport.use(new LocalStrategy(
  async function(email, password, done) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        console.log('Usuario no encontrado');
        return done(null, false, { message: 'Correo electrónico incorrecto' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Contraseña incorrecta');
        return done(null, false, { message: 'Contraseña incorrecta' });
      }

      console.log('Inicio de sesión exitoso');
      return done(null, user, { message: 'Inicio de sesión exitoso' });
    } catch (error) {
      console.error('Error de autenticación:', error);
      return done(error);
    }
  }
));

router.get('/auth/github', passport.authenticate('github'));

router.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/profile');
  }
);

router.get('/home', (req, res) => {
  const productosPath = join(currentDir, '..',  'productos.json');

  readFile(productosPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al leer el archivo de productos.');
    }

    const productos = JSON.parse(data);
    res.render('layouts/home', { productos });
  });
});

//--------------------
router.get('/realtimeproducts', async (req, res) => {
  try {

    const products = await Product.find();

    io.on("connection", socket => {
      console.log("Nuevo cliente conectado a la vista de productos en tiempo real");


      socket.emit("productos", products);
    });

    res.render('layouts/realTimeProducts', { products });
  } catch (error) {
    console.error('Error al obtener productos desde la base de datos:', error);
    res.status(500).send('Error interno del servidor');
  }
});



router.get("/chat", async (req, res) => {
  try {

    const messages = await Message.find();
    res.render('layouts/chat', { messages });
    
  } catch (error) {
    console.error("Error al obtener los mensajes:", error);
    res.status(500).send("Error interno del servidor");
  }
});

router.get('/products', checkLogin, async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const sortOrder = sort === 'desc' ? -1 : 1;
    const searchQuery = query ? { categoria: query } : {};

    const totalProducts = await Product.countDocuments(searchQuery);
    const skip = (page - 1) * limit;
    const products = await Product.find(searchQuery)
      .sort({ precio: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const totalPages = Math.ceil(totalProducts / limit);
    const user = req.user; 
    const userData = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };
    res.render('layouts/products', {
      products: products.map(product => ({
        _id: product._id,
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        cartId: '64c0be9764940b2a6dcfe013'
      })),
      user: userData, 
      currentPage: page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      sort,
      query,
    });
  } catch (error) {
    console.error('Error al obtener productos desde la base de datos:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});


router.get('/products/:pid', async (req, res) => {
  const productId = req.params.pid;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).send('Producto no encontrado');
      return;
    }

    res.render('layouts/productDetails', { 
      product: {
        _id: product._id,
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,

      }
    });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/api/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await Cart.findById(cartId).populate('products.product');

    if (!cart) {
      res.status(404).send('Carrito no encontrado');
      return;
    }

    res.render('layouts/cart', { cart });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});




router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Authentication Failed' });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ message: 'Authentication Successful' });
    });
  })(req, res, next);
});


router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/profile'); 
  }
  res.render('layouts/login', { message: req.flash('error') }); 
});

router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/profile'); 
  }
  res.render('layouts/register'); 
});

router.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration Successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  const user = req.user; 

  const userData = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    age: user.age,
  };

  res.render('layouts/profile', { user: userData });
});

router.get('/logout', (req, res) => {
  req.session.destroy(); 
  res.redirect('/login'); 
});

export default router;
