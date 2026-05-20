/**
 * errorMiddleware.js — Merkezi hata yönetimi
 * SOLID: Single Responsibility — Sadece hata işleme
 */

/**
 * Genel hata yakalayıcı
 */
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[ERROR] ${err.message}`);
  if (isDev) console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Sunucu hatası oluştu.',
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * 404 handler
 */
function notFound(req, res) {
  res.status(404).json({ error: `Endpoint bulunamadı: ${req.method} ${req.path}` });
}

module.exports = { errorHandler, notFound };
