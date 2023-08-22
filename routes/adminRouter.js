import express from 'express';
import { getAdminPage } from '../controllers/adminController.js';
import * as adminController from '../controllers/adminController.js'
const adminRouter = express.Router();

adminRouter.get('/', adminController.getAdminPage);
console.log('Ruta para admin configurada correctamente');


export default adminRouter;
