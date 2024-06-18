import { createServer } from 'net';

import { parseRequest } from './helpers';
import { PATH_HANDLERS, notFoundHandler } from './handlers';

const server = createServer((socket) => {
  socket.on('data', (data) => {
    const req = parseRequest(data);

    for (const { path, handler } of PATH_HANDLERS) {
      const regex = new RegExp(`^${path.replace(/{\w+}/g, '([^/]+)')}$`);
      const match = req.path.match(regex);

      if (match) {
        const params: any = {};
        const keys = path.match(/{\w+}/g);

        if (keys) {
          keys.forEach((key, index) => {
            params[key.slice(1, -1)] = match[index + 1];
          });
        }

        handler(socket, { ...req, params });
        return;
      }
    }

    notFoundHandler(socket);
  });

  socket.on('close', () => {
    socket.end();
  });
});

server.listen(4221, 'localhost');
