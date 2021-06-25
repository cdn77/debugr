import { ConsoleFormatter } from '../formatter';
import { PluginId } from '../plugins';
import { normalizeLogArgs } from '../utils';
import { LoggerInterface } from './loggerInterface';

export class ConsoleLogger implements LoggerInterface {
  private readonly formatter: ConsoleFormatter;

  private readonly threshold: number;

  constructor(formatter: ConsoleFormatter, threshold: number) {
    this.formatter = formatter;
    this.threshold = threshold;
  }

  log(level: number, data: Record<string, any>): void;
  log(level: number, message: string, data?: Record<string, any>): void;
  log(level: number, message: string, params?: any[], data?: Record<string, any>): void;
  log(plugin: PluginId, level: number, data: Record<string, any>): void;
  log(plugin: PluginId, level: number, message: string, data?: Record<string, any>): void;
  log(
    plugin: PluginId,
    level: number,
    message: string,
    params?: any[],
    data?: Record<string, any>,
  ): void;
  log(...args: any): void {
    const ts = Date.now();
    const [plugin, level, message, data] = normalizeLogArgs(args);

    if (level >= this.threshold) {
      for (const msg of this.formatter.format({ ts, plugin, level, message, data })) {
        console.log(msg);
      }
    }
  }
}
