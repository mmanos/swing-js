import './core';

(function(Swing) {
	var _id = 0;
	var _callbacks = {};
	var callbacks = function(el) {
		var id = ('undefined' !== typeof el._swevents) ? el._swevents : (el._swevents = _id++);
		_callbacks[id] = _callbacks[id] || {};
		return _callbacks[id];
	};

	Swing.on = function(el, events, handler, context) {
		var cbs = callbacks(el);

		events.replace(/\S+/g, function(event) {
			cbs[event] = cbs[event] || [];

			var record = {
				handler: handler,
				callback: function() {
					if (el.addEventListener || el.attachEvent) {
						var e = arguments[0];
						e.preventDefault = e.preventDefault || function() {e.returnValue = false;};
						if (!e.currentTarget) e.currentTarget = el;
					}

					context = 'undefined' === typeof context ? this : context;
					handler.apply(context, arguments);
				}
			};

			cbs[event].push(record);

			if (el.addEventListener) {
				el.addEventListener(event, record.callback);
			}
			else if (el.attachEvent) {
				el.attachEvent('on'+event, record.callback);
			}
		});

		return this;
	};

	Swing.off = function(el, events, handler) {
		var cbs = callbacks(el);

		events.replace(/\S+/g, function(event) {
			if (!cbs[event]) return;

			var record = null;
			for (var i = 0; i < cbs[event].length; i++) {
				if (cbs[event][i].handler === handler) {
					record = cbs[event][i];
					break;
				}
			}
			if (!record) return;

			if (el.removeEventListener) {
				el.removeEventListener(event, record.callback);
			}
			else if (el.detachEvent) {
				el.detachEvent('on'+event, record.callback);
			}

			cbs[event].splice(i, 1);
		});

		return this;
	};

	Swing.trigger = function(el, event) {
		var args = Array.prototype.slice.call(arguments);
		args = args.slice(2);
		args = (el.addEventListener || el.attachEvent) ? [{}].concat(args) : [event].concat(args);

		var cbs = callbacks(el);

		if (cbs[event]) {
			Swing.each(cbs[event], function(record) {
				record.callback.apply(this, args);
			});
		}

		if (cbs['all']) {
			Swing.each(cbs['all'], function(record) {
				record.callback.apply(this, args);
			});
		}

		return this;
	};

	Swing.observable = function(obj) {
		obj.prototype.on = function(event, handler, context) {
			Swing.on(this, event, handler, context);
		};
		obj.prototype.off = function(event, handler) {
			Swing.off(this, event, handler);
		};
		obj.prototype.trigger = function(event) {
			Swing.trigger.apply(
				Swing,
				[this].concat(Array.prototype.slice.call(arguments))
			);
		};

		return obj;
	};

	if (Swing.queueObservable) {
		for (var i = 0; i < Swing.queueObservable.length; i++) {
			Swing.observable(Swing.queueObservable[i]);
		}
	}
})(window.Swing || (window.Swing = {}));

export const on = window.Swing.on;
export const off = window.Swing.off;
export const trigger = window.Swing.trigger;
export const observable = window.Swing.observable;
