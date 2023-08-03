const mongoose = require("mongoose");

const conexion = async() => {

    try {

        await mongoose.connect("mongodb+srv://nancyq:protalento1@proyectos.eycogga.mongodb.net/blog?retryWrites=true&w=majority");

        // Parametros dentro de objeto // solo en caso de aviso
        // useNewUrlParser: true
        // useUnifiedTopology: true
        // useCreateIndex: true

        console.log("Conectado correctamente a la base de datos mi_blog !!");

    } catch(error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos !!");
    }

}

module.exports = {
    conexion
}