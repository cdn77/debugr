import { Logger } from './logger';

export { Services, Debugr, debugr } from './bootstrap';
export { Container, ContainerAware, Factory } from './di';
export { Events, EventDispatcher } from './events';
export {
  Formatter,
  FormatterTemplateMap,
  LayoutTemplate,
  EntryTemplate,
  formatDate,
  formatData,
  formatStack,
  escapeHtml,
  indent,
  unindent,
  isEmpty,
  pad,
  pad3,
} from './formatter';
export { Logger } from './logger';
export type LoggerInterface = Logger;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LoggerInterface = Logger;
export { Plugins, PluginManager, FormatterPlugin, Plugin } from './plugins';
export { GcOptions, LogEntry, LogEntryQueue, QueueManager, Writer } from './queues';
export { Options, LogLevel } from './types';
