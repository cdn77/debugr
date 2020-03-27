API docs
========

## Class `Debugr`

This is the user-facing interface of Debugr. The `debugr` factory function
returns an instance of this class. The class exposes methods for registering
and obtaining plugins from the `PluginManager` and for attaching event listeners
on the internal `EventDispatcher`.

### Methods

 - `registerPlugins(plugin: Plugin[]): void`

   Shortcut for batch registration of multiple plugins. See `registerPlugin()`.

 - `registerPlugin(plugin: Plugin): void`

   Registers a plugin instance in the PluginManager. If the plugin is `ContainerAware`
   its `injectContainer()` method is called.

 - `hasPlugin(id: string): boolean`

   Returns `true` if the PluginMananger has an instance of a plugin with the given ID.

 - `getPlugin(id: string): Plugin`

   Returns a plugin instance by its ID. Throws a exception if the plugin doesn't exist.

 - `on(event: string, listener: function): void`

   Registers a `listener` for the given `event`.

 - `once(event: string, listener: function): void`

   Registers a `listener` for the first occurrence of the given `event`.

 - `off(event: string, listener?: function): void`

   Removes a `listener` from the given `event`. If `listener` is not specified, removes
   all listeners for the given `event`.

 - `registerListeners(listeners: Record<string, function>): void`

   Shortcut for batch listener registration. See `on()`.

 - `createLogger(): Logger`

   Creates a new `Logger` instance.

## All of the other classes

tbd
