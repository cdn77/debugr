import { isPromise } from 'util/types';

export type ResultHandlers<R> = {
  then?: () => void;
  catch?: (e: any) => Promise<R> | R;
  finally?: () => void;
};

export function wrapPossiblePromise<R>(cb: () => R, handlers: ResultHandlers<R> | (() => void)): R;
export function wrapPossiblePromise<R>(
  cb: () => Promise<R>,
  handlers: ResultHandlers<R> | (() => void),
): Promise<R>;
export function wrapPossiblePromise<R>(
  cb: () => Promise<R> | R,
  handlers: ResultHandlers<R> | (() => void),
): Promise<R> | R {
  const {
    then,
    catch: ctch = undefined,
    finally: fnlly = undefined,
  } = typeof handlers === 'function' ? { then: handlers } : handlers;

  let result: R | Promise<any>;

  try {
    result = cb();
  } catch (e: any) {
    if (ctch) {
      return ctch(e);
    } else {
      throw e;
    }
  }

  if (isPromise(result)) {
    if (then) {
      result = result.then((r) => {
        then();
        return r;
      });
    }

    if (ctch) {
      result = result.catch((e: any) => ctch(e));
    }

    if (fnlly) {
      result = result.finally(fnlly);
    }

    return result;
  }

  try {
    then && then();
    return result;
  } catch (e) {
    if (ctch) {
      return ctch(e);
    } else {
      throw e;
    }
  } finally {
    fnlly && fnlly();
  }
}
