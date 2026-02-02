import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  // Utilise les variables d'Aiven sur Render, ou tes réglages locaux sur XAMPP
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "darseifboukhris",
  
  // Correction du type pour TypeScript : on force le passage en nombre
  port: Number(process.env.DB_PORT) || 23377, 
  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // SSL obligatoire pour se connecter à Aiven depuis Render
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null
});