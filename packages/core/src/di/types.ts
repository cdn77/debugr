import { Container } from './container';

export type Factory<S> = () => S;
export type ServiceId<S extends {} = {}> = Exclude<keyof S, number>;

export type ServiceMap = {
  [id: string]: any;
};

export type Service<S extends ServiceMap, ID extends ServiceId<S>> = S[ID];
export type ServiceFactory<S extends ServiceMap, ID extends ServiceId<S>, O = {}> = (
  container: Container<O, S>,
) => S[ID];

export type FactoryMap<S extends ServiceMap, O = {}> = {
  [ID in ServiceId<S>]: ServiceFactory<S, ID, O>;
};

export interface ContainerAware {
  injectContainer(container: Container): void;
}

export function isContainerAware(object: Record<string, any>): object is ContainerAware {
  return typeof object.injectContainer === 'function';
}
