module.exports = function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({ status: 'ok', service: 'questify-api' });
};
