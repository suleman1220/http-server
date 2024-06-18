export type Headers = { [key: string]: any };

export type Request = {
  method: string;
  path: string;
  version: string;
  headers: Headers;
  body: string;
};

export type SupportedEncoding = { [key: string]: string };
