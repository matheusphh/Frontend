const getDatabase = require('./_lib/db');

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  try {
    await getDatabase()`SELECT 1`;
    return response.status(200).json({ status: 'ok', service: 'questify-api', database: 'connected' });
  } catch (error) {
    console.error('Questify health check failed:', error);
    const code = error.message?.startsWith('Defina SUPABASE_DB_URL') ? 'MISSING_SUPABASE_DB_URL' : error.code || 'DATABASE_CONNECTION_FAILED';
    return response.status(503).json({ status: 'error', service: 'questify-api', code });
  }
};
