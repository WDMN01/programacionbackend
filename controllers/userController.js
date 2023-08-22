import User from "../dao/models/userModel.js";


export const getUserPremium = async (req, res) => {
   
    try {
        const user = await User.findById(req.params.uid);
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Error al obtener usuarios premium:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const uploadDocuments = async (req, res) => {

    try {
        const user = await User.findById(req.params.uid);

        req.files.forEach(file => {
            user.documents.push({
                name: file.originalname,
                reference: file.filename,
            });
        });
        await user.save();

        res.status(201).json({ message: 'Documentos subidos exitosamente' });
    } catch (error) {
        console.error('Error al subir documentos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
