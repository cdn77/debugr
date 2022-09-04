import type { CaptureBodyOption, HttpHeaders, NormalizedCaptureBodyOption } from './types';

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

export function filterHeaders(headers: HttpHeaders, exclude?: RegExp): HttpHeaders {
  if (!exclude) {
    return headers;
  }

  const filtered = { ...headers };

  for (const header of Object.keys(filtered)) {
    if (exclude.test(header)) {
      filtered[header] = '**redacted**';
    }
  }

  return filtered;
}

export function normalizeCaptureOption(option?: CaptureBodyOption): NormalizedCaptureBodyOption {
  if (typeof option === 'boolean' || typeof option === 'number' || option === undefined) {
    return option || false;
  } else if (typeof option === 'string' || Array.isArray(option)) {
    return normalizeTypePattern(option);
  } else {
    const map = new Map<RegExp, number>();

    for (const [type, length] of Object.entries(option)) {
      const pattern = normalizeTypePattern(type);
      pattern && map.set(pattern, length);
    }

    return map;
  }
}

export function isCaptureEnabled(
  option: NormalizedCaptureBodyOption,
  contentType?: string,
  contentLength?: number,
): boolean {
  if (typeof option === 'boolean') {
    return option;
  } else if (typeof option === 'number') {
    return contentLength !== undefined && contentLength <= option;
  } else {
    if (contentType === undefined) {
      return false;
    }

    if (option instanceof Map) {
      if (contentLength === undefined) {
        return false;
      }

      for (const [pattern, length] of option) {
        if (pattern.test(contentType)) {
          return contentLength <= length;
        }
      }

      return false;
    } else {
      return option.test(contentType);
    }
  }
}

function normalizeTypePattern(str: string | string[]): RegExp | false {
  if (!str.length) {
    return false;
  }

  const types = Array.isArray(str) ? str : str.split(/\s*,\s*|\s+/g);
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

export function normalizeHeaderPattern(headers?: string[]): RegExp | undefined {
  if (!headers || !headers.length) {
    return undefined;
  }

  const patterns = headers.map((header) => header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^(?:${patterns.join('|')})$`, 'i');
}
