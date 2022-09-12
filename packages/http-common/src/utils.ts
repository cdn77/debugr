import type {
  CaptureBodyChecker,
  CaptureBodyOption,
  HeaderFilter,
  HttpHeaders,
} from "./types";

const httpStatusMap: Record<number, string> = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  306: 'Switch Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

export function getHttpStatusMessage(status: number): string {
  return httpStatusMap[status] ?? '(unknown)';
}

export function formatHttpHeaders(headers: HttpHeaders): string {
  return Object.entries(headers)
    .map(([header, value]) =>
      Array.isArray(value) ? `${header}: ${value.join(`\n${header}: `)}` : `${header}: ${value}`,
    )
    .join('\n');
}

export function createHttpHeadersFilter(exclude?: string[]): HeaderFilter {
  if (!exclude || !exclude.length) {
    return (headers) => headers;
  }

  const patterns = exclude.map((header) => header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`^(?:${patterns.join('|')})$`, 'i');

  return (headers) => {
    const filtered = { ...headers };

    for (const header of Object.keys(filtered)) {
      if (pattern.test(header)) {
        filtered[header] = '**redacted**';
      }
    }

    return filtered;
  };
}

export function createHttpCaptureChecker(option: CaptureBodyOption = false): CaptureBodyChecker {
  if (typeof option === 'boolean') {
    return () => option;
  }

  if (typeof option === 'number') {
    return (rawContentType, rawContentLength) => {
      const contentLength = normalizeContentLength(rawContentLength);
      return contentLength !== undefined && contentLength <= option;
    };
  }

  if (Array.isArray(option) || typeof option === 'string') {
    const pattern = normalizeTypePattern(option);

    return (rawContentType) => {
      const contentType = normalizeContentType(rawContentType);
      return contentType !== undefined && pattern.test(contentType);
    };
  }

  const map = new Map<RegExp, CaptureBodyChecker>();

  for (const [pattern, test] of Object.entries(option)) {
    map.set(normalizeTypePattern(pattern), createHttpCaptureChecker(test));
  }

  return (rawContentType, rawContentLength) => {
    const contentType = normalizeContentType(rawContentType);

    if (contentType === undefined) {
      return false;
    }

    for (const [pattern, test] of map) {
      if (pattern.test(contentType)) {
        return test(rawContentType, rawContentLength);
      }
    }

    return false;
  };
}

function normalizeTypePattern(str: string | string[]): RegExp {
  const types = (Array.isArray(str) ? str.join(',') : str).trim().split(/\s*,\s*|\s+/g);

  if (!types.length) {
    throw new TypeError(`Invalid pattern: ${JSON.stringify(str)}`);
  }

  const patterns = types.map((type) =>
    type
      .toLowerCase()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\*/g, '.+'),
  );
  return new RegExp(`^(?:${patterns.join('|')})$`);
}

export function normalizeContentType(type?: number | string | string[]): string | undefined {
  const value = Array.isArray(type) ? type[0] : typeof type === 'number' ? type.toString() : type;
  return value ? value.replace(/\s*;.*$/, '').toLowerCase() : undefined;
}

export function normalizeContentLength(length?: number | string | string[]): number | undefined {
  const value = Array.isArray(length) ? length[0] : length;
  return typeof value === 'string' ? parseInt(value, 10) : value;
}
