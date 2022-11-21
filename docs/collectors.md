# Collector plugin development

The main purpose of Collector plugins is to collect logs from a given
source. If applicable, they can also provide integration between the source
and Debugr tasks - e.g. if a particular library executes code which can be
seen as a logical task, a Collector plugin for that library may implement
logic to wrap the execution in a Debugr task.

## The `CollectorPlugin` interface

Each Collector plugin must implement the `CollectorPlugin` interface, which
extends the generic [`Plugin` interface] and adds the following methods and properties:

 - `public readonly entryTypes: readonly EntryType[]`: This property lists any _specialised_
   entry types that the Collector produces. It is perfectly okay for a Collector plugin to produce
   _generic_ entry types as well; these don't need to be listed here.

Typically, a Collector plugin will implement the `injectLogger()` method from the base `Plugin`
interface to store a reference to the `Logger` instance, and then use that instance to log _generic_
entries using the `log()` method and its shortcuts, and / or _specialised_ entries using the `add()` method.
The `add()` method accepts a type argument specifying the type of _specialised_ log entry being added,
so that you get proper type checking both in your IDE and during compilation.

Keeping a reference to the `Logger` instance also allows Collector plugins to call the `runTask()` method
where appropriate to wrap some part (or parts) of the execution of the integrated library into a Debugr task.
Keep in mind that the library you're integrating (and your Collector plugin) might also be integrated with
other code, which may have its own Debugr integration, which might already handle Debugr tasks for the same
execution paths that your plugin would cover, so if your plugin does provide tasks' integration, it is
considered polite to provide an option which can disable this behaviour in order to prevent (usually harmless,
but often unnecessary) double-wrapping of tasks.

## Logging mutable data

As explained in the [main readme], problems may arise when one logs mutable data. Collectors should ideally
avoid this issue altogether by _not_ cloning anything that might be mutated. Importantly, the global cloning
strategy users can set on the `Logger` instance affects only data which passes through the `logger.log()`
method - anything you log using the `logger.add()` method will _never_ be cloned automatically. You can still
use the `snapshot.v8()` and `snapshot.json()` helpers if needed, both for `data` logged using `logger.log()`
and the `data` inside entries logged using `logger.add()`.

## An example Collector plugin

Let's say your application is using a 3rd party library to run some code at a scheduled time - a "Cron"
of sorts. Imagine a beautiful world where the 3rd party library provides sufficient options to hook into
the scheduled code execution, so you don't have to hack and monkey-patch things to get them working
the way you need:

```typescript
export declare class Scheduler {
  // middlewares will be called first, before any job lifecycle hooks
  public addMiddleware(mw: (job: string, cb: () => Promise<void> | void) => Promise<void> | void): void;
  
  // called at the start of a job after all middlewares run, but before the job itself runs
  public onJobStart(job: string, cb: () => void): void;
  
  // called at the end of a job after the job returns, but before returning to middlewares
  public onJobEnd(job: string, cb: (err?: Error) => void): void;
  
  // schedules a callback to be called every N seconds
  public schedule(job: string, cb: () => Promise<void> | void, interval: number): void;
}
```

Integrating with such a beautifully designed scheduler would be a piece of cake:

```typescript
export class SchedulerCollector implements CollectorPlugin {
  /**
   * These properties are part of the CollectorPlugin interface.
   * By convention we define them before anything else in the class
   * and separate them from other properties by a blank line.
   */
  public readonly id = 'scheduler'; // arbitrary, can be anything
  public readonly kind = PluginKind.Collector; // this is a Collector plugin after all
  public readonly entryTypes = []; // this plugin doesn't produce any specialised entries, only generic

  private readonly wrapTasks: boolean;
  private logger: Logger;

  /**
   * This is entirely up to us, but we want to provide an option
   * to turn off the wrapping of tasks
   */
  public constructor(wrapTasks: boolean = true) {
    this.wrapTasks = wrapTasks;
  }

  /**
   * Debugr will call this during initialisation; we want to
   * get a reference to the Logger instance to be used later.
   */
  public injectLogger(logger: Logger): void {
    this.logger = logger;
  }

  /**
   * We'll use this method when creating the Scheduler instance
   * to install the integration, e.g.:
   * 
   * const scheduler = new Scheduler();
   * logger.getPlugin('scheduler').install(scheduler);
   * return scheduler;
   */
  public install(scheduler: Scheduler): void {
    // Debugr Tasks integration
    if (this.wrapTasks) {
      scheduler.addMiddleware((job, cb) => this.logger.runTask(() => {
        // Collectors can provide additional metadata about the current task
        // via the task context:
        this.logger.setContextProperty('jobName', job);

        return cb();
      }));
    }

    scheduler.onJobStart((job) => this.logger.info(['Cron job "%s" started', job]));
    scheduler.onJobEnd((job, err) =>
      err
        ? this.logger.error(['Cron job "%s" ended with error', job], err)
        : this.logger.info(['Cron job "%s" ended successfully', job])
    );
  }
}
```


[`Plugin` interface]: ./general.md#plugin-types
[main readme]: ../README.md#logging-mutable-data
