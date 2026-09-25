module.exports = async function handler(req, res) {
  const { server, ready } = await import('../apps/mock-api/src/server.mjs');
  await ready();
  server.emit('request', req, res);
};
