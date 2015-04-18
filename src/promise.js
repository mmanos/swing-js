// Requires: <none>

(function(Swing) {
	Swing.promise = function() {
		var callbacks = [],
			promise = {
				resolve: resolve, reject: reject,
				then: then, done: done, fail: fail, always: always,
				state: 'pending', callbacks: callbacks
			};
		
		function complete(type) {
			var args = Array.prototype.slice.call(arguments);
			args = args.slice(1);
			
			promise.then = type === 'rejected'
				? function(resolve, reject) {reject.apply(this, args); return this;}
				: function(resolve)         {resolve.apply(this, args); return this;};
			promise.done = type === 'rejected'
				? function(resolve) {return this;}
				: function(resolve) {resolve.apply(this, args); return this;};
			promise.fail = type === 'rejected'
				? function(reject) {reject.apply(this, args); return this;}
				: function(reject) {return this;};
			promise.always = function(always) {always.apply(this, args); return this;};
			
			promise.resolve = promise.reject = function() {throw new Error('Promise already completed');};
			promise.state = type;
			
			var i = 0, cb;
			while (cb = callbacks[i++]) {cb[type] && cb[type].apply(cb[type], args);}
			
			callbacks = null;
		}
		
		function resolve() {
			complete.apply(this, ['resolved'].concat(Array.prototype.slice.call(arguments))); return this;
		}
		function reject() {
			complete.apply(this, ['rejected'].concat(Array.prototype.slice.call(arguments))); return this;
		}
		function then(resolve, reject) {
			callbacks.push({resolved: resolve, rejected: reject}); return this;
		}
		function done(resolve) {
			callbacks.push({resolved: resolve}); return this;
		}
		function fail(reject) {
			callbacks.push({rejected: reject}); return this;
		}
		function always(always) {
			callbacks.push({resolved: always, rejected: always}); return this;
		}
		
		return promise;
	};
	
	Swing.when = function() {
		if (arguments && arguments.length == 1
			&& Object.prototype.toString.call(arguments[0]) === '[object Array]'
		) {return this.when.apply(this, arguments[0]);}
		
		var d = this.promise(), args = arguments;
		
		if (!args || !args.length) {
			d.resolve(); return d;
		}
		
		var resolved = 0, responses = [];
		for (var i = 0; i < args.length; i++) {
			responses.push(null);
			
			(function(i) {
				args[i].done(function() {
					if ('pending' != d.state) {return;}
					responses[i] = arguments;
					if (++resolved == args.length) {d.resolve.apply(d, responses);}
				}).fail(function() {
					if ('pending' != d.state) {return;}
					responses[i] = arguments;
					d.reject.apply(d, responses);
				});
			})(i);
		}
		
		return d;
	};
})(window.Swing || (window.Swing = {}));
