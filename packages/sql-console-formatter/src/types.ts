export type QueryData = {
  query: string;
  parameters?: Record<string, any> | any[];
  error?: string;
  time?: number;
  affectedRows?: number;
  rows?: number;
};
