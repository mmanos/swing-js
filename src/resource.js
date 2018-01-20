// Requires: core.js, ajax.js

(function(Swing) {
	var id_counter = 0;
	
	Swing.resource = function(attributes, options) {
		options || (options = {});
		Object.defineProperty(this, '$rid', {value:'r'+(++id_counter)});
		Object.defineProperty(this, '$prev', {
			value        : attributes ? JSON.parse(JSON.stringify(attributes)) : attributes,
			configurable : true
		});
		this.$set(attributes || {}, options);
		this.$initialize.apply(this, arguments);
	};
	
	Swing.resource.prototype = {
		$initialize: function() {},
		
		$set: function(key, val) {
			var attr, attrs;
			if (key === null) return this;
			
			if (typeof key === 'object') {
				attrs = key;
			} else {
				(attrs = {})[key] = val;
			}
			
			for (attr in attrs) {
				this[attr] = attrs[attr];
			}
		},
		
		$url: function() {
			var base;
			if (this.$urlRoot) base = ('string' === typeof this.$urlRoot) ? this.$urlRoot : this.$urlRoot();
			else throw new Error('A "$url" property or function must be specified');
			
			var self = this;
			base = base.replace(
				/\{(\w*)\}/g,
				function(m, key) {
					return self.hasOwnProperty(key) ? self[key] : '';
				}
			);
			
			if (!this.id) return base;
			return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
		},
		
		$fetch: function(options) {
			options || (options = {});
			
			return Swing.ajax(Swing.extend({}, {
				url: ('string' === typeof this.$url) ? this.$url : this.$url()
			}, options)).done(Swing.bind(function(resp, xhr) {
					this.$set(resp);
					Object.defineProperty(this, '$prev', {value:JSON.parse(JSON.stringify(this.$toJSON())),configurable:true});
					return Swing.promise().resolve(this, resp, xhr, options);
				}, this))
				.fail(Swing.bind(function(xhr) {
					return Swing.promise().reject(this, xhr, options);
				}, this));
		},
		
		$save: function(options) {
			options || (options = {});
			
			return Swing.ajax(Swing.extend({}, {
				url: ('string' === typeof this.$url) ? this.$url : this.$url(),
				type: this.id ? 'PUT' : 'POST',
				data: Swing.extend({}, this.$toJSON(), options.extra_data ? options.extra_data : {})
			}, options))
				.done(Swing.bind(function(resp, xhr) {
					this.$set(resp);
					Object.defineProperty(this, '$prev', {value:JSON.parse(JSON.stringify(this.$toJSON())),configurable:true});
					return Swing.promise().resolve(this, resp, xhr, options);
				}, this))
				.fail(Swing.bind(function(xhr) {
					return Swing.promise().reject(this, xhr, options);
				}, this));
		},
		
		$destroy: function(options) {
			options || (options = {});
			
			return Swing.ajax(Swing.extend({}, {
				url: ('string' === typeof this.$url) ? this.$url : this.$url(),
				type: 'DELETE',
			}, options))
				.done(Swing.bind(function(resp, xhr) {
					this.$restore();
					return Swing.promise().resolve(this, resp, xhr, options);
				}, this))
				.fail(Swing.bind(function(xhr) {
					return Swing.promise().reject(this, xhr, options);
				}, this));
		},
		
		$restore: function() {
			this.$set(this.$prev || {});
		},
		
		$load: function(data) {
			this.$set(data);
			Object.defineProperty(this, '$prev', {value:JSON.parse(JSON.stringify(this.$toJSON())),configurable:true});
		},
		
		$toJSON: function() {
			var data = {};
			
			for (var prop in this) {
				if (this.hasOwnProperty(prop)) {
					data[prop] = this[prop];
				}
			}
			
			return data;
		},
		
		$hasChanged: function() {
			return JSON.stringify(this.$prev) != JSON.stringify(this.$toJSON());
		}
	};
	
	Swing.resource.query = function(options) {
		options || (options = {});
		var self = this;
		var instance = new self;
		
		return Swing.ajax(Swing.extend({}, {
			url: ('string' === typeof instance.$url) ? instance.$url : instance.$url()
		}, options)).done(Swing.bind(function(resp, xhr) {
				var models = [];
				if (Object.prototype.toString.call(resp) === '[object Array]') {
					for (var i = 0; i < resp.length; i++) {
						models.push(new self(resp[i]));
					}
				}
				return Swing.promise().resolve(models, resp, xhr, options);
			}, this))
			.fail(function(xhr) {
				return Swing.promise().reject(xhr, options);
			});
	};
	
	Swing.resource.find = function(id, options) {
		var self = this;
		var instance = new self({id:id});
		return instance.$fetch(options);
	};
	
	Swing.resource.paginate = function(page, num, options) {
		options || (options = {});
		
		var data = {page: page || 1};
		if (num) data.per_page = num;
		
		options.data || (options.data = {});
		Swing.extend(options.data, data);
		
		var self = this;
		return this.query(options).done(function(models, resp, xhr, options) {
			Object.defineProperty(models, 'page', {value:Number(xhr.getResponseHeader('X-Pagination-Page')),configurable:true});
			Object.defineProperty(models, 'per_page', {value:Number(xhr.getResponseHeader('X-Pagination-Per-Page')),configurable:true});
			Object.defineProperty(models, 'total', {value:Number(xhr.getResponseHeader('X-Pagination-Total')),configurable:true});
			Object.defineProperty(models, 'last_page', {value:Number(xhr.getResponseHeader('X-Pagination-Last-Page')),configurable:true});
			
			Object.defineProperty(models, '__resource_class__', {value:self,configurable:true});
			Object.defineProperty(models, 'paginate', {value:function(page2, num2, options2) {
				options2 = Swing.extend({}, options, options2);
				options2.data = Swing.extend({}, options.data, options2.data, {page:page2 || models.page});
				if (num2) options2.data.per_page = num2;
				
				if (options2.append) {
					var model_ids = [];
					for (var i = 0; i < models.length; i++) {
						if (models[i].id) model_ids.push(models[i].id);
					}
				}
				
				return self.query(options2).done(function(models2, resp2, xhr2, options2) {
					if (!options2.append) {
						while (models.length > 0) {
							models.pop();
						}
					}
					for (var i = 0; i < models2.length; i++) {
						if ('undefined' !== typeof model_ids && models2[i].id) {
							if (model_ids.indexOf(models2[i].id) === -1) {
								models.push(models2[i]);
							}
						}
						else {
							models.push(models2[i]);
						}
					}
					
					Object.defineProperty(models, 'page', {value:Number(xhr2.getResponseHeader('X-Pagination-Page')),configurable:true});
					Object.defineProperty(models, 'per_page', {value:Number(xhr2.getResponseHeader('X-Pagination-Per-Page')),configurable:true});
					Object.defineProperty(models, 'total', {value:Number(xhr2.getResponseHeader('X-Pagination-Total')),configurable:true});
					Object.defineProperty(models, 'last_page', {value:Number(xhr2.getResponseHeader('X-Pagination-Last-Page')),configurable:true});
				});
			},configurable:true});
		});
	};
	
	Swing.resource.all = function(num, options) {
		if (num && 'object' === typeof num) {
			options = num;
			num = null;
		}
		
		num = num ? num : 100;
		options || (options = {});
		options.data || (options.data = {});
		options.data.per_page = num;
		
		var d = Swing.promise();
		var all_models = [];
		var self = this;
		
		var queryPage = function(page) {
			options.data.page = page;
			self.query(options).done(function(models, resp, xhr, opts) {
				var num_models = models.length;
				while (models.length > 0) {
					all_models.push(models.shift());
				}
				
				if (num_models == num) {
					queryPage(page+1);
				}
				else {
					d.resolve(all_models, resp, xhr, opts);
				}
			}).fail(function(xhr, opts) {
				d.reject(xhr, opts);
			});
		};
		
		queryPage(1);
		
		return d;
	};
	
	if (Swing.inherits) Swing.resource.extend = Swing.inherits;
	else (Swing.queueInherits || (Swing.queueInherits = [])) && Swing.queueInherits.push(Swing.resource);
})(window.Swing || (window.Swing = {}));
