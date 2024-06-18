import { type Headers, type Request } from './types';

export const createResponse = (
  status: string,
  headers?: Headers,
  body?: string
): string => {
  const headersString = headers
    ? Object.entries(headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\r\n')
    : '';

  return `${status}\r\n${headersString}\r\n\r\n${body || ''}`;
};

export const parseRequest = (requestData: Buffer): Request => {
  const requestDataString = requestData.toString();
  const requestMetaEndIndex = requestDataString.indexOf('\r\n');
  const requestHeadersEndIndex = requestDataString.indexOf('\r\n\r\n');

  const [method, path, version] = requestDataString
    .slice(0, requestMetaEndIndex)
    .split(' ');
  const headers = requestDataString
    .slice(requestMetaEndIndex, requestHeadersEndIndex)
    .split('\r\n')
    .reduce((prev, curr) => {
      if (!curr) return prev;

      const [key, value] = curr.split(': ');
      const finalValue = value.includes(',')
        ? value.split(',').map((val) => val.trim())
        : value;

      return { ...prev, [key.toLowerCase()]: finalValue };
    }, {});
  const body = requestDataString
    .slice(requestHeadersEndIndex)
    .replace('\r\n\r\n', '');

  return { method, path, version, headers, body };
};

export const getFlagValue = (flag: string): string => {
  const flagIndex = process.argv.findIndex((arg) => arg.includes(`--${flag}`));

  if (flagIndex === -1) return '';

  const flagArg = process.argv[flagIndex];

  if (flagArg.includes('=')) return flagArg.split('=')[1].trim();

  return process.argv[flagIndex + 1].trim();
};
