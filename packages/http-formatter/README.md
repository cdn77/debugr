HTTP request and response formatter plugin for Debugr
=====================================================

*Plugin ID:* `http`

This is a formatter plugin, which means that when Debugr is creating
a dump file for a given logger, this plugin will be used for any entries
with the `plugin` attribute matching this plugin's ID. Such entries
will typically be created by another plugin, but you can also create them
manually by specifying the plugin ID as the very first argument to `logger.log()`
(before `level`). See below for the required shape of the `data` this
plugin expects to find in an entry.

The plugin doesn't have any options and you don't need to install or
configure it yourself as it will be done automatically if it is needed.

## Required entry data

```typescript
type RequestData = {
  type: 'request';
  method: string;
  uri: string;
  headers: Record<string, number | string | string[] | undefined>;
  ip?: string;
  body?: string;
  bodyLength: number;
  lengthMismatch: boolean;
};
```
