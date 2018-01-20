// Requires: <none>

(function(Swing) {
	Swing.promise = function(fn_cb) {
		var promise = {
				resolve: resolve, reject: reject, processCallbacks: processCallbacks,
				then: then, done: done, fail: fail, always: always,
				info: info, state: state, data: data, parent: null,
				_info: {state: 'pending', data: undefined, callbacks: []}
			};
		
		function nextCallback() {
			if (!info().callbacks.length) return;
			
			var cb = info().callbacks.shift();
			if (!cb) return;
			if (!cb[state()]) return nextCallback();
			
			var resp = cb[state()].apply(cb[state()], data());
			if (resp && resp.resolve && resp.reject && resp.then) {
				info().state = resp.state();
				info().callbacks = resp.info().callbacks.concat(info().callbacks);
				info().data = resp.data();
				resp.parent = promise;
				processCallbacks();
			}
			else if ('undefined' !== typeof resp) {
				info().data = [resp];
				nextCallback();
			}
			else {
				nextCallback();
			}
		}
		
		function complete(type) {
			info().state = type;
			
			var args = Array.prototype.slice.call(arguments);
			info().data = args.slice(1);
			
			nextCallback();
		}
		
		function resolve() {
			if ('pending' != state()) throw new Error('Promise already completed');
			complete.apply(this, ['resolved'].concat(Array.prototype.slice.call(arguments))); return promise;
		}
		function reject() {
			if ('pending' != state()) throw new Error('Promise already completed');
			complete.apply(this, ['rejected'].concat(Array.prototype.slice.call(arguments))); return promise;
		}
		function then(resolve, reject) {
			info().callbacks.push({resolved: resolve, rejected: reject}); return promise.processCallbacks();
		}
		function done(resolve) {
			info().callbacks.push({resolved: resolve}); return promise.processCallbacks();
		}
		function fail(reject) {
			info().callbacks.push({rejected: reject}); return promise.processCallbacks();
		}
		function always(always) {
			info().callbacks.push({resolved: always, rejected: always}); return promise.processCallbacks();
		}
		function info() {
			if (promise.parent) return promise.parent.info();
			return promise._info;
		}
		function state() {return info().state;}
		function data() {return info().data;}
		function processCallbacks() {
			if ('pending' != state()) nextCallback();
			return promise;
		}
		
		if (fn_cb) fn_cb(resolve, reject);
		
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
					if ('pending' != d.state()) {return;}
					responses[i] = arguments;
					if (++resolved == args.length) {d.resolve.apply(d, responses);}
				}).fail(function() {
					if ('pending' != d.state()) {return;}
					responses[i] = arguments;
					d.reject.apply(d, responses);
				});
			})(i);
		}
		
		return d;
	};
})(window.Swing || (window.Swing = {}));
