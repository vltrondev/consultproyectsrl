// netlify/functions/submit-topic.js
const { Pool } = require('pg');

// console.log("DATABASE_URL para submit-topic:", process.env.DATABASE_URL); // Para diagnóstico
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { // Supabase pooler requiere SSL.
      rejectUnauthorized: false // Necesario para desarrollo local y a veces para Netlify.
    }
});

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { topic_name, topic_title, topic_message } = JSON.parse(event.body);

        // Validar datos (básico)
        if (!topic_name || !topic_title || !topic_message) {
            return { statusCode: 400, body: JSON.stringify({ success: false, message: "Faltan campos requeridos." }) };
        }

        const query = 'INSERT INTO topics (author, title, content) VALUES ($1, $2, $3) RETURNING id';
        const values = [topic_name, topic_title, topic_message];

        const client = await pool.connect();
        try {
            const result = await client.query(query, values);
            console.log("Nuevo tema guardado con ID:", result.rows[0].id);
        } finally {
            client.release();
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "Tema propuesto y guardado." }),
        };
    } catch (error) {
        console.error("Error al procesar el tema:", error);
        return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error al procesar la propuesta de tema." }) };
    }
};