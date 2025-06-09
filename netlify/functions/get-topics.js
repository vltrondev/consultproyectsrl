// netlify/functions/get-topics.js
const { Pool } = require('pg');

// console.log("DATABASE_URL para get-topics:", process.env.DATABASE_URL); // Para diagnóstico
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { // Supabase pooler requiere SSL.
      rejectUnauthorized: false // Necesario para desarrollo local y a veces para Netlify.
    }
});

exports.handler = async function(event, context) {
    try {
        const client = await pool.connect();
        let topics;
        try {
            // Asegúrate que las columnas coincidan con lo que espera tu frontend
            // y que el formato de 'date' sea el adecuado o lo formatees aquí.
            const result = await client.query('SELECT id, title, author, content, TO_CHAR(created_at, \'DD de Mes, YYYY\') as date FROM topics ORDER BY created_at DESC');
            topics = result.rows;
        } finally {
            client.release();
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(topics),
        };
    } catch (error) {
        console.error("Error al cargar los temas:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "No se pudieron cargar los temas." }),
        };
    }
};