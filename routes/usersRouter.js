import express from 'express';
import multer from 'multer';
import * as userController from '../controllers/userController.js'; 
import User from '../dao/models/userModel.js';
const usersRouter = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'uploads/documents';

        if (req.body.fileType === 'profileImage') {
            folder = 'uploads/profiles';
        } else if (req.body.fileType === 'productImage') {
            folder = 'uploads/products';
        }

        cb(null, folder);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
usersRouter.post('/:uid/documents', upload.array('documents'), userController.uploadDocuments);

const checkLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login'); 
    }
    next(); 
};
  
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).json({ message: 'Acceso denegado' });
    }
};

usersRouter.get('/premium/:uid', userController.getUserPremium);

const users = [
    {
        "_id": "64e1a08c559e628273f4b52f",
        "first_name": "prueba",
        "last_name": "premium",
        "email": "premiump@gmail.com",
        "age": 23,
        "password": "$2b$10$vPu21ckkgzbd5sOKFZF6ieH5RmRCfqSiy5gsqEZKyKhVhWMw3d.66",
        "role": "premium",
        "__v": 0,
        "documents": []
    },
  
];

function getUserDetails(userId) {
    return users.find(user => user._id === userId);
}
usersRouter.get('/:id/premium', (req, res) => {
    const userId = req.params.id;
    const user = getUserDetails(userId);

    if (user && user.role === 'premium') {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'Usuario premium no encontrado' });
    }
});





usersRouter.put('/premium/:uid', isAdmin, async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await User.findById(uid);
    
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
    
        const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];

        // Verificar si el usuario ha cargado todos los documentos requeridos
        const hasAllRequiredDocuments = requiredDocuments.every(document => {
            return user.documents.some(doc => doc.name === document);
        });

        if (hasAllRequiredDocuments) {
            user.role = 'premium';
            await user.save();
            return res.status(200).json({ message: `Rol de usuario actualizado a premium` });
        } else {
            return res.status(400).json({ message: 'El usuario debe cargar todos los documentos requeridos para ser premium' });
        }
    } catch (error) {
        console.error('Error al cambiar el rol del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default usersRouter;
