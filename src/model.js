// Requires: core.js, promise.js, ajax.js

(function(Swing) {
	var id_counter = 0;
	var isEqual = function(a, b) {
		if (a === b) return a !== 0 || 1 / a == 1 / b;
		if (a == null || b == null) return a === b;
		var className = toString.call(a);
		if (className != toString.call(b)) return false;
		switch (className) {
			case '[object String]': return a == String(b);
			case '[object Number]': return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
			case '[object Date]':
			case '[object Boolean]': return +a == +b;
		}
		if (typeof a != 'object' || typeof b != 'object') return false;
		return JSON.stringify(a) === JSON.stringify(b);
	};

	Swing.model = function(attributes, options) {
		options || (options = {});
		this.mid = 'm'+(++id_counter);
		this.attributes = {};
		if (options.collection) this.collection = options.collection;
		this.set(attributes || {}, options);
		this.initialize.apply(this, arguments);
	};

	Swing.model.prototype = {
		idAttribute: 'id',

		initialize: function(){},

		get: function(attr) {
			return this.attributes[attr];
		},

		has: function(attr) {
			return this.get(attr) != null;
		},

		set: function(key, val, options) {
			var attr, attrs, prev, changed;
			if (key == null) return this;

			// Handle both `"key", value` and `{key: value}` -style arguments.
			if (typeof key === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			options || (options = {});

			prev = Swing.extend({}, this.attributes);

			// Check for changes of `id`.
			if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

			// For each `set` attribute, update the current value.
			for (attr in attrs) {
				val = attrs[attr];
				if (!isEqual(prev[attr], val)) {
					this.attributes[attr] = val;
					changed = true;
					if (!options.silent) {
						this.trigger('change:'+attr, this, val, prev[attr], options);
					}
				}
			}

			if (changed) {
				this.trigger('change', this, options);
			}

			return this;
		},

		url: function() {
			var base;
			if (this.urlRoot) base = ('string' === typeof this.urlRoot) ? this.urlRoot : this.urlRoot();
			else if (this.collection && this.collection.url) base = ('string' === typeof this.collection.url) ? this.collection.url : this.collection.url();
			else throw new Error('A "url" property or function must be specified');

			if (!this.has(this.idAttribute)) return base;
			return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.get(this.idAttribute));
		},

		fetch: function(options) {
			options = options ? Swing.extend({}, options) : {};
			var d = Swing.promise();

			Swing.ajax(Swing.extend({}, options, {
				url: ('string' === typeof this.url) ? this.url : this.url(),
				type: 'GET'
			})).done(Swing.bind(function(resp) {
					this.set(resp, options);
					d.resolve(this, resp, options);
					this.trigger('sync', this, resp, options);
				}, this))
				.fail(Swing.bind(function(resp) {
					d.reject(this, resp, options);
					this.trigger('error', this, resp, options);
				}, this));

			return d;
		},

		save: function(key, val, options) {
			var attrs, d = Swing.promise();

			// Handle both `"key", value` and `{key: value}` -style arguments.
			if (key == null || typeof key === 'object') {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}

			options = Swing.extend({}, options);

			// If attributes exist, save acts as, `set(attr).save(null, opts)`.
			if (attrs) {
				this.set(attrs, options);
			}

			Swing.ajax(Swing.extend({}, options, {
				url: ('string' === typeof this.url) ? this.url : this.url(),
				type: this.has(this.idAttribute) ? 'PUT' : 'POST',
				data: Swing.extend({}, this.attributes, options.data ? options.data : {})
			})).done(Swing.bind(function(resp) {
					this.set(resp, options);
					d.resolve(this, resp, options);
					this.trigger('sync', this, resp, options);
				}, this))
				.fail(Swing.bind(function(resp) {
					d.reject(this, resp, options);
					this.trigger('error', this, resp, options);
				}, this));

			return d;
		},

		destroy: function(options) {
			options = options ? Swing.extend({}, options) : {};
			var d = Swing.promise();

			var destroy = Swing.bind(function() {
				this.trigger('destroy', this, this.collection, options);
			}, this);

			if (!this.has(this.idAttribute)) {
				destroy();
				d.resolve(this, null, options);
				return d;
			}

			Swing.ajax(Swing.extend({}, options, {
				url: ('string' === typeof this.url) ? this.url : this.url(),
				type: 'DELETE'
			})).done(Swing.bind(function(resp) {
					if (options.wait) destroy();
					d.resolve(this, resp, options);
					this.trigger('sync', this, resp, options);
				}, this))
				.fail(Swing.bind(function(resp) {
					d.reject(this, resp, options);
					this.trigger('error', this, resp, options);
				}, this));

			if (!options.wait) destroy();

			return d;
		}
	};

	if (Swing.inherits) Swing.model.extend = Swing.inherits;
	else (Swing.queueInherits || (Swing.queueInherits = [])) && Swing.queueInherits.push(Swing.model);

	if (Swing.observable) Swing.observable(Swing.model);
	else (Swing.queueObservable || (Swing.queueObservable = [])) && Swing.queueObservable.push(Swing.model);

	if (Swing.collection) Swing.collection.prototype.model = Swing.model;
})(window.Swing || (window.Swing = {}));
