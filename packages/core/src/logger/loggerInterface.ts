import { PluginId } from '../plugins';

export interface LoggerInterface {
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
}
