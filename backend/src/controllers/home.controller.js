const getHome = (req, res) => {
  try {
    res.json({
      message: "Bienvenido a la página de inicio",
      status: "Página de inicio funcionando correctamente",
      data: {
        title: "Bienvenido a la página de inicio",
        description: "Esta es la página de inicio de la aplicación",
        content: "Contenido de la página de inicio",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      status: "Error",
      error: error.message,
    });
  }
};

module.exports = {
  getHome,
};
