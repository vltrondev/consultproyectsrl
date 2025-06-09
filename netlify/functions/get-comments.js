// netlify/functions/get-comments.js
const { Pool } = require('pg');

// console.log("DATABASE_URL para get-comments:", process.env.DATABASE_URL); // Para diagnóstico
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { // Supabase pooler requiere SSL.
      rejectUnauthorized: false // Necesario para desarrollo local y a veces para Netlify.
    }
});

exports.handler = async function(event, context) {
    const topicId = event.queryStringParameters.topicId;

    if (!topicId) {
        return { statusCode: 400, body: JSON.stringify({ error: "Falta topicId" }) };
    }

    try {
        const client = await pool.connect();
        let commentsForTopic;
        try {
            // Asegúrate que las columnas coincidan con lo que espera tu frontend
            // y que el formato de 'date' sea el adecuado o lo formatees aquí.
            const result = await client.query('SELECT id, author, text, TO_CHAR(created_at, \'DD de Mes, YYYY\') as date FROM comments WHERE topic_id = $1 ORDER BY created_at ASC', [topicId]);
            commentsForTopic = result.rows;
        } finally {
            client.release();
        }
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(commentsForTopic),
        };
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "No se pudieron cargar los comentarios." }) };
    }
};