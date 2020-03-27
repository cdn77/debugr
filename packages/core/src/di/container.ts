import { Factory, FactoryMap, Service, ServiceFactory, ServiceId, ServiceMap } from './types';

export class Container<O extends {} = {}, S extends ServiceMap = ServiceMap> {
  readonly options: O;

  private readonly services: S;

  private readonly factories: FactoryMap<S>;

  constructor(options: O, factories: FactoryMap<S>) {
    this.options = options;
    this.services = {} as S;
    this.factories = factories;
  }

  get<ID extends ServiceId<S>>(id: ID): Service<S, ID> {
    if (!(id in this.services)) {
      this.services[id] = this.create(id);
    }

    return this.services[id];
  }

  register<ID extends ServiceId<S>>(id: ID, service: Service<S, ID>): void {
    this.services[id] = service;
  }

  registerFactory<ID extends ServiceId<S>>(id: ID, factory: ServiceFactory<S, ID>): void {
    this.factories[id] = factory;
  }

  create<ID extends ServiceId<S>>(id: ID): Service<S, ID> {
    if (id in this.factories) {
      return this.factories[id](this);
    } else {
      throw new Error(`Unknown service: '${id}'`);
    }
  }

  createFactory<ID extends ServiceId<S>>(id: ID): Factory<Service<S, ID>> {
    if (id in this.factories) {
      const factory = this.factories[id];
      return () => factory(this);
    } else {
      throw new Error(`Unknown service: '${id}'`);
    }
  }
}
