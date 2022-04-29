// import { EventEmitter } from 'events';
// import { Events } from './types';

// export class EventDispatcher {
//   private readonly events: EventEmitter;

//   constructor() {
//     this.events = new EventEmitter();
//     this.events.setMaxListeners(1000);
//   }

//   emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): boolean {
//     return this.events.emit(event as string, ...args);
//   }

//   on<E extends keyof Events>(event: E, listener: Events[E]): this {
//     this.events.on(event as string, listener);
//     return this;
//   }

//   once<E extends keyof Events>(event: E, listener: Events[E]): this {
//     this.events.once(event as string, listener);
//     return this;
//   }

//   off<E extends keyof Events>(event: E, listener?: Events[E]): this {
//     if (listener) {
//       this.events.off(event as string, listener);
//     } else {
//       this.events.removeAllListeners(event as string);
//     }

//     return this;
//   }

//   register(listeners: Partial<Events>): this {
//     for (const [event, listener] of Object.entries(listeners)) {
//       listener && this.events.on(event, listener);
//     }

//     return this;
//   }
// }
