GraphQL request formatter plugin for Debugr
===========================================

**Plugin ID:** `graphql`

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
export type GraphQLData = {
  query: string;
  operation?: string;
  variables?: Record<string, any>;
};
```
