// netlify/functions/submit-comment.js
const { Pool } = require('pg');

// console.log("DATABASE_URL para submit-comment:", process.env.DATABASE_URL); // Para diagnóstico
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
        const { topicId, comment_name, comment_message } = JSON.parse(event.body);

        // Validar datos (básico)
        if (!topicId || !comment_name || !comment_message) {
            return { statusCode: 400, body: JSON.stringify({ success: false, message: "Faltan campos requeridos para el comentario." }) };
        }

        const query = 'INSERT INTO comments (topic_id, author, text) VALUES ($1, $2, $3) RETURNING id';
        const values = [topicId, comment_name, comment_message];

        const client = await pool.connect();
        try {
            const result = await client.query(query, values);
            console.log(`Nuevo comentario guardado con ID ${result.rows[0].id} para el tema ${topicId}`);
        } finally {
            client.release();
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "Comentario enviado y guardado." }),
        };
    } catch (error) {
        console.error("Error al procesar el comentario:", error);
        return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error al procesar el comentario." }) };
    }
};