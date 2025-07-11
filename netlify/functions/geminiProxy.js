// netlify/functions/geminiProxy.js

// Usamos 'node-fetch' para hacer la llamada a la API desde el entorno de Node.js de la función
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // 1. Validar que la petición sea de tipo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // 2. Obtener la clave de API desde las variables de entorno de Netlify
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured on server.' }),
    };
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    // 3. Obtener el cuerpo de la petición original del cliente
    const requestBody = JSON.parse(event.body);

    // 4. Realizar la petición a la API de Gemini
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // 5. Devolver la respuesta de Gemini al cliente
    const data = await response.json();
    
    // Manejo de errores de la API de Gemini
    if (!response.ok) {
        console.error('Gemini API Error:', data);
        return {
            statusCode: response.status,
            body: JSON.stringify(data),
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Proxy Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};