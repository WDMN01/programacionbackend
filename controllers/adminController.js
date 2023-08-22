import User from '../dao/models/userModel.js'; // Importa el modelo User desde la ubicación correcta

export const getAdminPage = async (req, res) => {
  try {
    // Aquí obtienes los datos de los usuarios desde la base de datos usando el modelo User
    const usersData = await User.find(); // Por ejemplo, usando el modelo User

    res.render('admin', { usersData }); // Renderiza la vista 'admin' y pasa los datos de usuarios
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
