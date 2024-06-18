import { type SupportedEncoding } from './types';

export const Status = {
  OK: 'HTTP/1.1 200 OK',
  NOT_FOUND: 'HTTP/1.1 404 Not Found',
  CREATED: 'HTTP/1.1 201 Created',
};

export const SUPPORTED_ENCODINGS: SupportedEncoding = {
  gzip: 'gzip',
};
