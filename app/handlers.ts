import { gzipSync } from 'zlib';
import { readFileSync, writeFileSync } from 'fs';
import { type Socket } from 'net';

import { createResponse, getFlagValue } from './helpers';
import { SUPPORTED_ENCODINGS, Status } from './constants';
import { type Request, type Headers } from './types';

type RequestWithParams = Request & { params?: any };

const filesDirectory = getFlagValue('directory');

const echoHandler = (socket: Socket, req: RequestWithParams) => {
  let { text } = req.params;
  const acceptedEncodings = req.headers?.['accept-encoding'];
  const supportedEncoding = Array.isArray(acceptedEncodings)
    ? acceptedEncodings.find(
        (encoding: string) => !!SUPPORTED_ENCODINGS[encoding]
      )
    : SUPPORTED_ENCODINGS[acceptedEncodings];
  const responseHeaders: Headers = {
    'Content-Type': 'text/plain',
    'Content-Length': text.length,
  };

  if (supportedEncoding) {
    responseHeaders['Content-Encoding'] = supportedEncoding;

    if (supportedEncoding === 'gzip') {
      text = gzipSync(text);
      responseHeaders['Content-Length'] = text.length;
    }
  }

  socket.write(createResponse(Status.OK, responseHeaders));
  if (text) socket.write(text);
  socket.end();
};

const filesHandler = (socket: Socket, req: RequestWithParams) => {
  const { fileName } = req.params;
  const filePath = `${filesDirectory}${fileName}`;

  switch (req.method) {
    case 'GET':
      try {
        const data = readFileSync(filePath, 'utf8');

        socket.write(
          createResponse(
            Status.OK,
            {
              'Content-Type': 'application/octet-stream',
              'Content-Length': data.length,
            },
            data
          )
        );
      } catch (err) {
        socket.write(createResponse(Status.NOT_FOUND));
      }

      break;
    case 'POST':
      writeFileSync(filePath, req.body, { encoding: 'utf-8' });

      socket.write(createResponse(Status.CREATED));

      break;
    default:
      socket.write(createResponse(Status.NOT_FOUND));

      break;
  }

  socket.end();
};

const userAgentHandler = (socket: Socket, req: RequestWithParams) => {
  const userAgent = req.headers['user-agent'];

  socket.write(
    createResponse(
      Status.OK,
      {
        'Content-Type': 'text/plain',
        'Content-Length': userAgent.length,
      },
      userAgent
    )
  );
  socket.end();
};

const successHandler = (socket: Socket, req: RequestWithParams) => {
  socket.write(createResponse(Status.OK));
  socket.end();
};

export const notFoundHandler = (socket: Socket) => {
  socket.write(createResponse(Status.NOT_FOUND));
  socket.end();
};

export const PATH_HANDLERS = [
  {
    path: '/echo/{text}',
    handler: echoHandler,
  },
  {
    path: '/files/{fileName}',
    handler: filesHandler,
  },
  {
    path: '/user-agent',
    handler: userAgentHandler,
  },
  {
    path: '/',
    handler: successHandler,
  },
];
