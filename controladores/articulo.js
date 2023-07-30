const fs = require("fs");
const path = require("path");
const { validarArticulo } = require("../helpers/validar");
const Articulo = require("../modelos/Articulo");

const prueba = (req, res) => {
  return res.status(200).json({
    mensaje: "Soy una acción de prueba en mi controlador de artículos",
  });
};

const curso = (req, res) => {
  console.log("Se ha ejecutado el endpoint probando");
  return res.status(200).json([
    {
      curso: "Master en React",
      autor: "Víctor Robles WEB",
      url: "victorroblesweb.es/master-react",
    },
    {
      curso: "Master en React",
      autor: "Víctor Robles WEB",
      url: "victorroblesweb.es/master-react",
    },
  ]);
};

const crear = async (req, res) => {
  // Recoger parametros por post a guardar
  let parametros = req.body;

  // Validar datos
  try {
    validarArticulo(parametros);
  } catch (error) {
    return res.status(400).json({
      status: "error",
      mensaje: "Faltan datos por enviar",
    });
  }

  // Crear el objeto a guardar
  const articulo = new Articulo(parametros);

  try {
    // Guardar el artículo en la base de datos
    const articuloGuardado = await articulo.save();

    if (!articuloGuardado) {
      return res.status(400).json({
        status: "error",
        mensaje: "No se ha guardado el artículo",
      });
    }

    // Devolver resultado
    return res.status(200).json({
      status: "success",
      articulo: articuloGuardado,
      mensaje: "Articulo creado con éxito!!",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Hubo un error al guardar el artículo",
    });
  }
};

const listar = async (req, res) => {
  try {
    let consulta = Articulo.find({});

    if (req.params.ultimos) {
      consulta.limit(3);
    }

    const articulos = await consulta.sort({ fecha: -1 }).exec();

    return res.status(200).send({
      status: "success",
      contador: articulos.length,
      articulos,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Hubo un error al listar los artículos",
    });
  }
};

const uno = async (req, res) => {
  // Recoger un id por la url
  let id = req.params.id;

  try {
    // Buscar el articulo
    const articulo = await Articulo.findById(id);

    // Si no existe devolver error
    if (!articulo) {
      return res.status(404).json({
        status: "error",
        mensaje: "No se ha encontrado el artículo",
      });
    }

    // Devolver resultado
    return res.status(200).json({
      status: "success",
      articulo,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Hubo un error al buscar el artículo",
    });
  }
};

const borrar = async (req, res) => {
  let articuloId = req.params.id;

  try {
    const articuloBorrado = await Articulo.findOneAndDelete({
      _id: articuloId,
    });

    if (!articuloBorrado) {
      return res.status(500).json({
        status: "error",
        mensaje: "Error al borrar el artículo",
      });
    }

    return res.status(200).json({
      status: "success",
      articulo: articuloBorrado,
      mensaje: "Método de borrar",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Hubo un error al borrar el artículo",
    });
  }
};

const editar = async (req, res) => {
  // Recoger id articulo a editar
  let articuloId = req.params.id;

  // Recoger datos del body
  let parametros = req.body;

  // Validar datos
  try {
    validarArticulo(parametros);
  } catch (error) {
    return res.status(400).json({
      status: "error",
      mensaje: "Faltan datos por enviar",
    });
  }

  try {
    // Buscar y actualizar articulo
    const articuloActualizado = await Articulo.findOneAndUpdate(
      { _id: articuloId },
      req.body,
      { new: true }
    );

    if (!articuloActualizado) {
      return res.status(500).json({
        status: "error",
        mensaje: "Error al actualizar",
      });
    }

    // Devolver respuesta
    return res.status(200).json({
      status: "success",
      articulo: articuloActualizado,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Hubo un error al actualizar el artículo",
    });
  }
};

const subir = async (req, res) => {
  // Configurar multer

  // Recoger el fichero de imagen subido
  if (!req.file && !req.files) {
    return res.status(404).json({
      status: "error",
      mensaje: "Petición inválida",
    });
  }

  // Nombre del archivo
  let archivo = req.file.originalname;

  // Extension del archivo
  let archivo_split = archivo.split(".");
  let extension = archivo_split[1];

  // Comprobar extension correcta
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    // Borrar archivo y dar respuesta
    fs.unlink(req.file.path, (error) => {
      return res.status(400).json({
        status: "error",
        mensaje: "Imagen inválida",
      });
    });
  } else {
    // Recoger id articulo a editar
    let articuloId = req.params.id;

    try {
      // Buscar y actualizar articulo con la propiedad de imagen
      const articuloActualizado = await Articulo.findOneAndUpdate(
        { _id: articuloId },
        { imagen: req.file.filename },
        { new: true }
      );

      if (!articuloActualizado) {
        return res.status(500).json({
          status: "error",
          mensaje: "Error al actualizar el artículo",
        });
      }

      // Devolver respuesta
      return res.status(200).json({
        status: "success",
        articulo: articuloActualizado,
        fichero: req.file,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        mensaje: "Hubo un error al actualizar el artículo",
      });
    }
  }
};

const imagen = (req, res) => {
  let fichero = req.params.fichero;
  let ruta_fisica = "./imagenes/articulos/" + fichero;

  fs.stat(ruta_fisica, (error, existe) => {
    if (existe) {
      return res.sendFile(path.resolve(ruta_fisica));
    } else {
      return res.status(404).json({
        status: "error",
        mensaje: "La imagen no existe",
        existe,
        fichero,
        ruta_fisica,
      });
    }
  });
};

const buscador = async (req, res) => {
  // Sacar el string de busqueda
  let busqueda = req.params.busqueda;

  try {
    // Find OR
    const articulosEncontrados = await Articulo.find({
      $or: [
        { titulo: { $regex: busqueda, $options: "i" } },
        { contenido: { $regex: busqueda, $options: "i" } },
      ],
    })
      .sort({ fecha: -1 })
      .exec();

    if (!articulosEncontrados || articulosEncontrados.length <= 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No se han encontrado artículos",
      });
    }

    return res.status(200).json({
      status: "success",
      articulos: articulosEncontrados,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Hubo un error al realizar la búsqueda",
    });
  }
};

module.exports = {
  prueba,
  curso,
  crear,
  listar,
  uno,
  borrar,
  editar,
  subir,
  imagen,
  buscador,
};
