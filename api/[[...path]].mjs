import { server, ready } from '../apps/mock-api/src/server.mjs';

export default async function handler(req, res) {
  await ready();
  server.emit('request', req, res);
}
