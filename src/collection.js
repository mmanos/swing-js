import './core';
import './ajax';
import './events';
import './model';

(function(Swing) {
	var id_counter = 0;

	Swing.collection = function(models, options) {
		options || (options = {});
		this.cid = 'c'+(++id_counter);
		if (options.model) this.model = options.model;
		this.length = 0;
		this.models = [];
		this._byId  = {};
		this.initialize.apply(this, arguments);
		if (models) this.reset(models, Swing.extend({silent: true}, options));
	};

	Swing.collection.prototype = {
		model: null,

		initialize: function(){},

		add: function(models, options) {
			models = (Object.prototype.toString.call(models) === '[object Array]') ? models : [models];
			options || (options = {});

			var i, model, existing;
			for (i = 0; i < models.length; i++) {
				model = models[i];

				if (existing = this.get(model)) {
					existing.set(model.attributes ? model.attributes : model, options);
					continue;
				}

				model = (model instanceof Swing.model) ? model : new this.model(model, options);
				this._byId[model.mid] = model;
				if (model.id) this._byId[model.id] = model;
				this.models.push(model);
				this.length++;

				this._addReference(model, options);

				if (!options.silent) {
					model.trigger('add', model, this, options);
				}
			}

			return this;
		},

		remove: function(models, options) {
			models = (Object.prototype.toString.call(models) === '[object Array]') ? models : [models];
			options || (options = {});

			var i, index, model;
			for (i = 0; i < models.length; i++) {
				model = this.get(models[i]);
				if (!model) continue;

				delete this._byId[model.id];
				delete this._byId[model.mid];
				index = this.models.indexOf(model);
				this.models.splice(index, 1);
				this.length--;

				if (!options.silent) {
					options.index = index;
					model.trigger('remove', model, this, options);
				}

				this._removeReference(model, options);
			}

			return this;
		},

		reset: function(models, options) {
			options || (options = {});

			this.remove(this.models, Swing.extend({silent:true}, options));

			this.length = 0;
			this.models = [];
			this._byId  = {};

			if (models) this.add(models, Swing.extend({silent:true}, options));

			if (!options.silent) this.trigger('reset', this, options);

			return this;
		},

		get: function(obj) {
			if (obj == null) return void 0;
			return this._byId[obj] || this._byId[obj.id] || this._byId[obj.mid];
		},

		at: function(index) {
			return this.models[index];
		},

		indexOf: function(obj) {
			return this.models.indexOf(obj);
		},

		first: function() {
			if (this.models == null) return void 0;
			return this.models[0];
		},

		last: function() {
			if (this.models == null) return void 0;
			return this.models[this.models.length - 1];
		},

		each: function(iterator, context) {
			return Swing.each(this.models, iterator, context);
		},

		size: function() {
			return this.models.length;
		},

		isEmpty: function() {
			return this.size() === 0;
		},

		fetch: function(options) {
			if (!this.url) throw new Error('A "url" property or function must be specified');

			options = options ? Swing.extend({}, options) : {};
			var d = Swing.promise();

			Swing.ajax(Swing.extend({}, options, {
				url: ('string' === typeof this.url) ? this.url : this.url(),
				type: 'GET'
			})).done(Swing.bind(function(resp) {
					options.reset ? this.reset(resp, options) : this.add(resp, options);
					d.resolve(this, resp, options);
					this.trigger('sync', this, resp, options);
				}, this))
				.fail(Swing.bind(function(resp) {
					d.reject(this, resp, options);
					this.trigger('error', this, resp, options);
				}, this));

			return d;
		},

		_addReference: function(model, options) {
			if (!model.collection) model.collection = this;
			model.on('all', this._onModelEvent, this);
		},

		_removeReference: function(model, options) {
			if (this === model.collection) delete model.collection;
			model.off('all', this._onModelEvent, this);
		},

		_onModelEvent: function(event, model, options) {
			if (model && this !== model.collection) return;
			if (model && event === 'destroy') this.remove(model, options);
			if (model && event === 'change:' + model.idAttribute) {
				if (model.id != null) this._byId[model.id] = model;
			}
			this.trigger.apply(this, arguments);
		}
	};

	if (Swing.inherits) Swing.collection.extend = Swing.inherits;
	else (Swing.queueInherits || (Swing.queueInherits = [])) && Swing.queueInherits.push(Swing.collection);

	if (Swing.observable) Swing.observable(Swing.collection);
	else (Swing.queueObservable || (Swing.queueObservable = [])) && Swing.queueObservable.push(Swing.collection);

	if (Swing.model) Swing.collection.prototype.model = Swing.model;
})(window.Swing || (window.Swing = {}));

export default window.Swing.collection;
