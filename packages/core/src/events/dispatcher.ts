import { EventEmitter } from 'events';
import { Events } from './types';

export class EventDispatcher {
  private readonly eventEmitter: EventEmitter;

  public constructor(eventEmitter: EventEmitter, maxListeners: number = 1000) {
    this.eventEmitter = eventEmitter;
    this.eventEmitter.setMaxListeners(maxListeners);
  }

  public static create(): EventDispatcher {
    return new EventDispatcher(new EventEmitter(), 1000);
  }

  public emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): boolean {
    return this.eventEmitter.emit(event as string, ...args);
  }

  public on<E extends keyof Events>(event: E, listener: Events[E]): this {
    this.eventEmitter.on(event as string, listener);
    return this;
  }

  public once<E extends keyof Events>(event: E, listener: Events[E]): this {
    this.eventEmitter.once(event as string, listener);
    return this;
  }

  public off<E extends keyof Events>(event: E, listener?: Events[E]): this {
    if (listener) {
      this.eventEmitter.off(event as string, listener);
    } else {
      this.eventEmitter.removeAllListeners(event as string);
    }

    return this;
  }

  public register(listeners: Partial<Events>): this {
    for (const [event, listener] of Object.entries(listeners)) {
      listener && this.eventEmitter.on(event, listener);
    }

    return this;
  }
}
