(function(Swing) {
	Swing.each = function(obj, iterator, context) {
		var i, length;
		if (obj.length === +obj.length) {
			for (i = 0, length = obj.length; i < length; i++) {
				if (iterator.call(context, obj[i], i, obj) === false) return;
			}
		} else {
			var keys = [];
			for (var key in obj) keys.push(key);
			for (i = 0, length = keys.length; i < length; i++) {
				if (iterator.call(context, obj[keys[i]], keys[i], obj) === false) return;
			}
		}
		return obj;
	};

	Swing.inArray = function(elem, arr) {
		if (!arr) return false;
		for (var i = 0; i < arr.length; i++) {
			if (elem == arr[i]) return true;
		}
		return false;
	};

	Swing.bind = function(fn, context) {
		return function() {
			return fn.apply(context, arguments);
		};
	};

	Swing.ready = function(f) {
		/in/.test(document.readyState) ? setTimeout('Swing.ready('+f+')', 9) : f();
	};

	Swing.extend = function(obj) {
		Swing.each(Array.prototype.slice.call(arguments, 1), function(source) {
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		});

		return obj;
	};

	Swing.isNumeric = function(value) {
		return !isNaN(parseFloat(value)) && isFinite(value);
	};

	Swing.isArray = function(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	};

	Swing.debounce = function(fn, delay, context) {
		var timer;
		return function() {
			context || (context = this);
			var args = Array.prototype.slice.call(arguments);
			clearTimeout(timer);
			timer = setTimeout(function() {
				fn.apply(context, args);
			}, delay);
		};
	};

	Swing.inherits = function(protoProps, staticProps) {
		var parent = this, child = function(){return parent.apply(this, arguments);};
		Swing.extend(child, parent, staticProps);
		var Surrogate = function(){this.constructor = child;};
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;
		if (protoProps) Swing.extend(child.prototype, protoProps);
		child.__super__ = parent.prototype;
		return child;
	};

	if (Swing.queueInherits) {
		for (var i = 0; i < Swing.queueInherits.length; i++) {
			Swing.queueInherits[i].extend = Swing.inherits;
		}
	}
})(window.Swing || (window.Swing = {}));

export const each = window.Swing.each;
export const inArray = window.Swing.inArray;
export const bind = window.Swing.bind;
export const ready = window.Swing.ready;
export const extend = window.Swing.extend;
export const isNumeric = window.Swing.isNumeric;
export const isArray = window.Swing.isArray;
export const debounce = window.Swing.debounce;
export const inherits = window.Swing.inherits;
export default window.Swing;
