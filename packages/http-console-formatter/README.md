HTTP request and response formatter plugin for Debugr console formatter
=====================================================

**Plugin ID:** `http`

This is a formatter plugin, which means that when Debugr is creating
a log, this plugin will be used for any entries
with the `plugin` attribute matching this plugin's ID. Such entries
will typically be created by another plugin, but you can also create them
manually by specifying the plugin ID as the very first argument to `logger.log()`
(before `level`). See below for the required shape of the `data` this
plugin expects to find in an entry.

The plugin doesn't have any options and you don't need to install or
configure it yourself as it will be done automatically if it is needed.

## Required entry data

```typescript
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
```

### Notes:
 - The `headers` property is type-compatible with both `IncomingHttpHeaders`
   and `OutgoingHttpHeaders` from the native `http` module, so you can usually
   pass them in directly.
 - The `bodyLength` property should be set to the *actual* length of the body
   (not derived from the `Content-Length` header). Obviously its purpose is
   to have access to the actual body length even if the body itself isn't captured.
 - The `lengthMismatch` property should indicate that the *actual* length of the
   body didn't match the `Content-Length` header.
