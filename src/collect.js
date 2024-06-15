import './core';
import './events';

(function(Swing) {
	Swing.collect = function(items, options) {
		if (!(this instanceof Swing.collect)) return new Swing.collect(items, options);
		options || (options = {});
		this.items = null;
		this.initialize.apply(this, arguments);
		if (items) this.add(items);
	};

	Swing.collect.prototype = {
		initialize: function() {},

		isOrdered: function() {
			return Swing.isArray(this.items) && this.items !== null;
		},

		isKeyed: function() {
			return typeof this.items === 'object' && this.items !== null && !this.isOrdered();
		},

		add: function(items) {
			if (Swing.isArray(items)) {
				if (!this.items) this.items = [];
				for (var i = 0; i < items.length; i++) {
					this.push(items[i]);
				}
			}
			else if (typeof items === 'object') {
				if (!this.items) this.items = {};
				for (var key in items) {
					this.put(key, items[key]);
				}
			}
			return this;
		},

		has: function(key) {
			if (this.items === null) return false;
			return typeof this.items[key] !== 'undefined';
		},

		get: function(key, defaultValue) {
			return this.has(key) ? this.items[key] : defaultValue || null;
		},

		put: function(key, value) {
			if (this.items === null) this.items = {};
			this.items[key] = value;
			return this;
		},

		pull: function(key) {
			const value = this.get(key);
			this.remove(key);
			return value;
		},

		remove: function(key) {
			if (!this.has(key)) {
				return this;
			}
			if (this.isKeyed()) {
				delete this.items[key];
			}
			else if (this.isOrdered()) {
				this.items.splice(key, 1);
			}
			return this;
		},

		indexOf: function(value) {
			if (this.items === null) this.items = [];
			return this.items.indexOf(value);
		},

		push: function(value) {
			if (this.items === null) this.items = [];
			this.items.push(value);
			return this;
		},
		
		prepend: function(value) {
			if (this.items === null) this.items = [];
			this.items.unshift(value);
			return this;
		},

		pop: function() {
			if (this.items === null) this.items = [];
			return this.items.pop();
		},

		shift: function() {
			if (this.items === null) this.items = [];
			return this.items.shift();
		},

		size: function() {
			if (this.isOrdered()) {
				return this.items.length;
			}
			else if (this.isKeyed()) {
				return this.keys().all().length;
			}
			return 0;
		},

		isEmpty: function() {
			return this.size() === 0;
		},

		keys: function() {
			if (this.isKeyed()) {
				return Swing.collect(Object.keys(this.items));
			}
			else if (this.isOrdered()) {
				var keys = [];
				for (var i = 0; i < this.size(); i++) {
					keys.push(i);
				}
				return Swing.collect(keys);
			}
			return Swing.collect();
		},

		values: function() {
			if (this.isOrdered()) {
				var values = Swing.collect();
				for (var i = 0; i < this.items.length; i++) {
					if (typeof this.items[i] !== 'undefined') {
						values.push(this.items[i])
					}
				}
				return values;
			}
			else if (this.isKeyed()) {
				var values = Swing.collect();
				for (var key in this.items) {
					values.push(this.items[key]);
				}
				return values;
			}
			return Swing.collect();
		},

		all: function() {
			return this.items;
		},

		first: function() {
			if (this.isOrdered()) {
				return this.get(0);
			}
			else if (this.isKeyed()) {
				return this.get(this.keys().first());
			}
			return null;
		},

		last: function() {
			if (this.isOrdered()) {
				return this.get(this.size() - 1);
			}
			else if (this.isKeyed()) {
				var keys = this.keys().all();
				return this.get(keys[keys.length - 1]);
			}
			return null;
		},

		max: function(key) {
			var max = null;
			this.each(function(value) {
				var v = value;
				if (key && typeof value === 'object' && typeof value[key] !== 'undefined') {
					v = value[key];
				}
				if (max === null) {
					max = v;
				}
				else if (v > max) {
					max = v;
				}
			}, this);
			return max;
		},

		min: function(key) {
			var max = null;
			this.each(function(value) {
				var v = value;
				if (key && typeof value === 'object' && typeof value[key] !== 'undefined') {
					v = value[key];
				}
				if (max === null) {
					max = v;
				}
				else if (v < max) {
					max = v;
				}
			}, this);
			return max;
		},

		contains: function(key, value) {
			if (typeof key === 'function') {
				var callback = key;
				var context = value;
				if (this.isOrdered()) {
					for (var i = 0; i < this.size(); i++) {
						if (callback.call(context, this.items[i], i, this.items)) {
							return true;
						}
					}
				}
				else if (this.isKeyed()) {
					for (var k in this.items) {
						if (callback.call(context, this.items[k], k, this.items)) {
							return true;
						}
					}
				}
			}
			else if (this.isOrdered()) {
				value = key;
				return this.indexOf(value) !== -1;
			}
			else if (this.isKeyed()) {
				if (typeof value === 'undefined') {
					value = key;
					key = null;
				}
				if (key) {
					return this.get(key) === value;
				}
				return this.values().indexOf(value) !== -1;
			}
			return false;
		},

		filter: function(callback, context) {
			if (this.isOrdered()) {
				for (var i = this.size() - 1; i >= 0; i--) {
					if (!callback.call(context, this.items[i], i, this.items)) {
						this.remove(i);
					}
				}
			}
			else if (this.isKeyed()) {
				for (var k in this.items) {
					if (!callback.call(context, this.items[k], k, this.items)) {
						this.remove(k);
					}
				}
			}
			return this;
		},

		reverse: function() {
			if (this.isOrdered()) {
				this.items.reverse();
			}
			else if (this.isKeyed()) {
				var items = {};
				var keys = this.keys().all();
				for (var i = keys.length - 1; i >= 0; i--) {
					var key = keys[i];
					items[key] = this.items[key];
				}
				this.items = items;
			}
			return this;
		},

		map: function(callback, context) {
			if (this.isOrdered()) {
				for (var i = this.size() - 1; i >= 0; i--) {
					this.items[i] = callback.call(context, this.items[i], i, this.items);
				}
			}
			else if (this.isKeyed()) {
				for (var k in this.items) {
					this.items[k] = callback.call(context, this.items[k], k, this.items);
				}
			}
			return this;
		},

		pluck: function(key, keyName) {
			var plucked = Swing.collect();
			this.each(function(value) {
				if (typeof value === 'object') {
					if (keyName) {
						plucked.put(value[keyName], value[key]);
					}
					else {
						plucked.push(value[key]);
					}
				}
			}, this);
			return plucked;
		},

		where: function(key, operator, value) {
			if (typeof value === 'undefined') {
				value = operator;
				operator = '===';
			}
			return this.filter(function(item, index) {
				if (typeof item !== 'object') return false;
				var val = item[key];
				switch (operator) {
					case '==':
						return val == value;
					case '!=':
						return val != value;
					case '!==':
						return val !== value;
					case '<':
						return val < value;
					case '<=':
						return val <= value;
					case '>':
						return val > value;
					case '>=':
						return val >= value;
					case 'contains':
						return val.indexOf(value) !== -1;
					default:
						return val === value;
				}
			}, this);
		},

		sort: function(compareFn) {
			if (typeof compareFn === 'undefined') {
				compareFn = function(a, b) {
					if (a < b) return -1;
					else if (a > b) return 1;
					return 0;
				};
				if (this.isKeyed()) {
					compareFn = function(a, b) {
						if (a[1] < b[1]) return -1;
						else if (a[1] > b[1]) return 1;
						return 0;
					};
				}
			}
			if (this.isOrdered()) {
				this.items.sort(compareFn);
			}
			else if (this.isKeyed()) {
				var sortable = [];
				for (var key in this.items) {
					sortable.push([key, this.items[key]]);
				}
				console.log('in sort - isKeyed', sortable);
				sortable.sort(compareFn);
				this.reset();
				for (var i = 0; i < sortable.length; i++) {
					this.put(sortable[i][0], sortable[i][1]);
				}
			}
			return this;
		},

		sortDesc: function() {
			if (this.isKeyed()) {
				return this.sort(function(a, b) {
					if (a[1] < b[1]) return 1;
					else if (a[1] > b[1]) return -1;
					return 0;
				});
			}
			return this.sort(function(a, b) {
				if (a < b) return 1;
				else if (a > b) return -1;
				return 0;
			});
		},

		sortBy: function(key) {
			return this.sort(function(a, b) {
				if (typeof a !== 'object' || typeof b !== 'object') return 0;
				if (a[key] < b[key]) return -1;
				else if (a[key] > b[key]) return 1;
				return 0;
			});
		},

		sortByDesc: function(key) {
			return this.sort(function(a, b) {
				if (typeof a !== 'object' || typeof b !== 'object') return 0;
				if (a[key] < b[key]) return 1;
				else if (a[key] > b[key]) return -1;
				return 0;
			});
		},

		sortKeys: function(compareFn) {
			if (typeof compareFn === 'undefined') {
				compareFn = function(a, b) {
					if (a < b) return -1;
					else if (a > b) return 1;
					return 0;
				};
			}
			if (!this.isKeyed()) {
				return this;
			}
			var items = this.all();
			var keys = this.keys().all();
			keys.sort(compareFn);
			this.reset();
			for (var i = 0; i < keys.length; i++) {
				this.put(keys[i], items[keys[i]]);
			}
			return this;
		},

		sortKeysDesc: function() {
			return this.sortKeys(function(a, b) {
				if (a < b) return 1;
				else if (a > b) return -1;
				return 0;
			});
		},

		reset: function() {
			if (this.isOrdered()) {
				this.items = [];
			}
			else if (this.isKeyed()) {
				this.items = {};
			}
			return this;
		},

		each: function(iterator, context) {
			return Swing.each(this.items, iterator, context);
		},

		clone: function() {
			return Swing.collect(this.items);
		},

		toJSON: function() {
			return JSON.stringify(this.items);
		}
	};

	if (Swing.inherits) Swing.collect.extend = Swing.inherits;
	else (Swing.queueInherits || (Swing.queueInherits = [])) && Swing.queueInherits.push(Swing.collect);

	if (Swing.observable) Swing.observable(Swing.collect);
	else (Swing.queueObservable || (Swing.queueObservable = [])) && Swing.queueObservable.push(Swing.collect);
})(window.Swing || (window.Swing = {}));

export default window.Swing.collect;
