// Lightweight health check endpoint to verify Vercel mapping without touching DB
module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
};
