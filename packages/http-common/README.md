Common HTTP interfaces and utilities
=======================================

This package defines the shape of the `data` included in entries which
represent a HTTP request. Plugins which produce or consume such entries
should conform to this shape. Unless you're developing a Debugr plugin
or log handler, you usually don't need to worry about this package, as it will
be installed and used automatically when required.

## For plugin developers

The package exports the following type definitions:

```typescript
export interface HttpRequestData {
  type: 'request';
  method: string;           // The uppercase HTTP request method, e.g. 'GET', 'POST' etc.
  uri: string;              // The request URI including query string, if any
  headers?: HttpHeaders;    // A map of HTTP headers to values or lists of values. Header names should be lower-case.
  ip?: string;              // The client IP, if it can be determined.
  body?: string;            // The request body as a string, if the request body was captured.
  bodyLength?: number;      // Request body length in bytes derived from the actual request data, NOT from the Content-Length header.
  lengthMismatch?: boolean; // This should be `true` if the actual request body length didn't match the Content-Length header.
}

export interface HttpResponseData {
  type: 'response';
  status: number;           // HTTP response status code.
  message?: string;         // HTTP response status message.
  headers?: HttpHeaders;    // A map of HTTP headers; same format as for request headers.
  body?: string;            // The response body as a string, if the response body was captured.
  bodyLength?: number;      // Response body length in bytes derived from the actual response data, NOT from the Content-Length header.
  lengthMismatch?: boolean; // This should be `true` if the actual response body length didn't match the Content-Length header.
}

export interface HttpLogEntry<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = TContextShape,
  > extends LogEntry<TTaskContext, TGlobalContext> {
  format: 'http';
  data: HttpRequestData | HttpResponseData;
}
```

There is also a number of utility functions exported:

 - `getHttpStatusMessage(status: number): string` - This function will return the standard HTTP status message for a given
   status code, or `(unknown)` if no message is defined for the status code.
 - `formatHttpHeaders(headers: HttpHeaders): string` - This function will format a HTTP header map similarly to the way
   the headers would be formatted in an actual request or response header. This is intended to be a formatting shortcut
   for log handlers trying to display information about a request or a response, there is no guarantee that headers
   formatted this way will be spec-compliant or usable in an actual request or response.
 - `createHttpHeadersFilter(exclude?: string[]): HeaderFilter` - This function will create a filter callback which you can
   use to replace the value of any headers in the `exclude` list with the string `**redacted**`. Typically, you'd use this
   for headers containing sensitive information, like `Cookie` or `Authorization`.
 - `createHttpCaptureChecker(option: CaptureBodyOption = false): CaptureBodyChecker` - This function will create a callback
   which you can use to check whether a particular request or response body should be captured according to rules defined
   by the provided `CaptureBodyOption`. A `boolean` means what you'd expect it to mean: `true` means always capture, `false`
   means never capture. If you pass in a `number`, it is interpreted as the maximum body size in bytes. If you pass in a `string`
   or a `string[]`, it will be converted to a pattern which will be tested against the `Content-Type` header. The pattern
   can contain an asterisk (`*`) to represent one or more characters; the string can also contain multiple patterns separated
   by a comma (`,`) or one or more whitespace characters. All of the following are examples of valid patterns: `text/html`,
   `text/*`, `text/*, application/json`, `['image/svg', 'text/*, application/json']`. The last form the `CaptureBodyOption`
   can take is a `Record<string, boolean | number>`, where the keys are patterns matched against the `Content-Type` header
   and the values are either booleans or numbers with the same semantics as described above; when no matching entry exists
   for a particular content type, `false` is assumed.
 - `normalizeContentType(type?: number | string | string[]): string | undefined` - This function normalizes the content type
   from a request or response header map into a string, optionally stripping any postfixes after the first `;` character.
 - `normalizeContentLength(length?: number | string | string[]): number | undefined` - This function normalizes the content
   length from a request or response header map into a number.
