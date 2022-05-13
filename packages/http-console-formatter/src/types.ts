export type RequestData = {
  type: 'request';
  method: string;
  uri: string;
  headers: Record<string, number | string | string[] | undefined>;
  ip?: string;
  body?: string;
  bodyLength?: number;
  lengthMismatch: boolean;
};

export type ResponseData = {
  type: 'response';
  status: number;
  message: string;
  headers: Record<string, number | string | string[] | undefined>;
  body?: string;
  bodyLength?: number;
  lengthMismatch: boolean;
};
