// Requires: promise.js

(function(Swing) {
	var _definitions = {};
	
	/**
	 * Return the definition object for the requsted name.
	 *
	 * @param string name
	 * 
	 * @return object
	 */
	var _definition = function(name) {
		var definition = _definitions[name] = _definitions[name]
			? _definitions[name]
			: {promise: Swing.promise()};
		
		return definition;
	}
	
	/**
	 * Attempt to resolve the given module name. Load any dependencies, first.
	 *
	 * @param string name
	 * 
	 * @return Swing.promise
	 */
	var _attemptResolve = function(name) {
		var definition = _definition(name);
		
		// Return if module has not yet been defined.
		if ('undefined' === typeof definition.module) {
			return definition.promise;
		}
		
		// Return if already resolved.
		if ('pending' != definition.promise.state()) {
			return definition.promise;
		}
		
		// Attempt to resolve any dependencies.
		var promises = [];
		for (var i = 0; i < definition.dependencies.length; i++) {
			promises.push(_attemptResolve(definition.dependencies[i]));
		}
		
		// Resolve this module when all dependencies are resolved.
		Swing.when(promises).done(function() {
			// If module is a function, call and store the response.
			if ({}.toString.call(definition.module) === '[object Function]') {
				var args = [];
				for (var i = 0; i < definition.dependencies.length; i++) {
					args.push(_definition(definition.dependencies[i]).module);
				}
				
				definition.module = definition.module.apply(definition.module, args);
			}
			
			// If module is a promise, wait for it to resolve.
			if (definition.module.resolve && definition.module.reject) {
				definition.module.done(function(module) {
					definition.module = module;
					if ('pending' == definition.promise.state()) {
						definition.promise.resolve();
					}
				});
			}
			else {
				if ('pending' == definition.promise.state()) {
					definition.promise.resolve();
				}
			}
		});
		
		return definition.promise;
	};
	
	/**
	 * Define a module and it's dependencies.
	 *
	 * @param string   name
	 * @param array    dependencies
	 * @param function module
	 * 
	 * @return void
	 */
	Swing.define = function(name, dependencies, module) {
		var definition = _definition(name);
		
		if ('undefined' === typeof module) {
			module = dependencies;
			dependencies = [];
		}
		
		definition.dependencies = dependencies;
		definition.module = module;
		
		// Attempt to resolve this definition if things are waiting on it.
		if ('pending' == definition.promise.state()
			&& definition.promise.callbacks
			&& definition.promise.callbacks.length
		) {
			_attemptResolve(name);
		}
	};
	
	/**
	 * Execute the given callback when it's dependencies are met.
	 *
	 * @param array    dependencies
	 * @param function callback
	 * 
	 * @return void
	 */
	Swing.require = function(dependencies, callback) {
		var promises = [];
		for (var i = 0; i < dependencies.length; i++) {
			promises.push(_attemptResolve(dependencies[i]));
		}
		
		Swing.when(promises).done(function() {
			var args = [];
			for (var i = 0; i < dependencies.length; i++) {
				args.push(_definition(dependencies[i]).module);
			}
			
			callback.apply(callback, args);
		});
	};
})(window.Swing || (window.Swing = {}));
