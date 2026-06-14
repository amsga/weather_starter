import type { Application } from 'express';
import type { IncomingMessage } from 'node:http';
import { Readable } from 'node:stream';
import { Socket } from 'node:net';

type Headers = Record<string, string>;

interface MockResponse {
  statusCode: number;
  headers: Headers;
  setHeader(name: string, value: string): void;
  getHeader(name: string): string | undefined;
  status(code: number): MockResponse;
  json(value: unknown): MockResponse;
  send(value?: unknown): MockResponse;
  end(value?: unknown): MockResponse;
}

export async function invokeJson(
  app: Application,
  options: {
    method: string;
    path: string;
    body?: unknown;
    headers?: Headers;
  },
): Promise<{ status: number; body: unknown }> {
  const bodyText = options.body === undefined ? '' : JSON.stringify(options.body);
  const request = new Readable({
    read() {
      if (bodyText) {
        this.push(bodyText);
      }
      this.push(null);
    },
  }) as Readable as IncomingMessage & {
    method: string;
    url: string;
    headers: Headers;
    socket: Socket;
  };
  request.method = options.method;
  request.url = options.path;
  request.headers = {
    ...(options.body === undefined ? {} : { 'content-type': 'application/json' }),
    ...(options.body === undefined ? {} : { 'content-length': Buffer.byteLength(bodyText).toString() }),
    ...options.headers,
  };
  request.socket = new Socket();

  return await new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    let status = 200;
    let payload = '';
    const response: MockResponse = {
      statusCode: 200,
      headers: {} as Headers,
      setHeader(name: string, value: string) {
        this.headers[name.toLowerCase()] = value;
      },
      getHeader(name: string) {
        return this.headers[name.toLowerCase()];
      },
      status(code: number) {
        status = code;
        this.statusCode = code;
        return this;
      },
      json(value: unknown) {
        this.setHeader('content-type', 'application/json; charset=utf-8');
        payload = JSON.stringify(value);
        this.end(payload);
        return this;
      },
      send(value?: unknown) {
        if (typeof value === 'string') {
          payload = value;
        } else if (value !== undefined) {
          payload = JSON.stringify(value);
        }
        this.end(payload);
        return this;
      },
      end(value?: unknown) {
        if (typeof value === 'string') {
          payload = value;
        } else if (Buffer.isBuffer(value)) {
          payload = value.toString('utf8');
        }
        queueMicrotask(() => {
          try {
            resolve({
              status,
              body: payload ? JSON.parse(payload) : undefined,
            });
          } catch (error) {
            reject(error);
          }
        });
        return this;
      },
    };

    try {
      app(request, response as never);
    } catch (error) {
      reject(error);
    }
  });
}
