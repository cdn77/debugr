import type { MappedRecord } from '@debugr/core';
import { LogLevel } from '@debugr/core';
import type { SentryLogLevel } from './types';

export const defaultLevelMap: MappedRecord<LogLevel, SentryLogLevel> = {
  [LogLevel.TRACE]: 'debug',
  [LogLevel.DEBUG]: 'debug',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARNING]: 'warning',
  [LogLevel.ERROR]: 'error',
  [LogLevel.FATAL]: 'fatal',
  [LogLevel.INTERNAL]: 'error',
};
