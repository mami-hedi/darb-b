import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  // Si process.env.DB_HOST existe (sur Render), il l'utilise, sinon il prend "localhost"
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "darseifboukhris",
  port: process.env.DB_PORT || 3306, // Aiven utilise un port différent de 3306
  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // AJOUT INDISPENSABLE POUR AIVEN (SSL)
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null
});
