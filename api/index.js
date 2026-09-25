module.exports = async function handler(req, res) {
  const raw = req.query && req.query.path;
  if (raw) {
    const suffix = Array.isArray(raw) ? raw.join('/') : String(raw);
    const q = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const cleaned = q.replace(/([?&])path=[^&]*/g, '$1').replace(/\?&/, '?').replace(/[?&]$/, '');
    req.url = `/api/${suffix}${cleaned}`;
  }
  const { server, ready } = await import('../apps/mock-api/src/server.mjs');
  await ready();
  server.emit('request', req, res);
};
