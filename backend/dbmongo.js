import mongoose from "mongoose";

// URI local estándar de MongoDB
const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/type_racer_stats_db_mongo";

async function connectStatsDB() {
  try {
    await mongoose.connect(LOCAL_MONGO_URI);
    console.log("✅ Conexión local a MongoDB exitosa.");
  } catch (error) {
    // Si ves ECONNREFUSED aquí, el servidor 'mongod' no está corriendo (ver paso 1)
    console.error(
      "❌ Error al conectar a MongoDB. Asegúrate de que mongod esté activo:",
      error.message
    );
  }
}

export default connectStatsDB;
