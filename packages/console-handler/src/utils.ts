import { PluginManager, TContextBase, TContextShape } from '@debugr/core';
import {
  GraphQLConsoleFormatter,
  ConsoleFormatterPlugin,
  HttpConsoleFormatter,
  isConsoleFormatter,
  SqlConsoleFormatter,
} from './formatters';

export function getFormatters<
  TTaskContext extends TContextBase = TContextBase,
  TGlobalContext extends TContextShape = {},
>(
  pluginManager: PluginManager<TTaskContext, TGlobalContext>,
): Record<string, ConsoleFormatterPlugin<TTaskContext, TGlobalContext>> {
  const formatters = Object.fromEntries(
    pluginManager.find(isConsoleFormatter).map((p) => [p.entryFormat, p]),
  );

  for (const format of pluginManager.getKnownEntryFormats()) {
    if (!formatters[format]) {
      switch (format) {
        case 'graphql':
          formatters[format] = new GraphQLConsoleFormatter();
          break;
        case 'http':
          formatters[format] = new HttpConsoleFormatter();
          break;
        case 'sql':
          formatters[format] = new SqlConsoleFormatter();
          break;
        default:
          throw new Error(`Missing console formatter plugin for the '${format}' entry format`);
      }
    }
  }

  return formatters;
}
