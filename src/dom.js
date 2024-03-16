import './core';
import './events';

(function(Swing) {
	var _i = 0;

	var Dom = Swing.dom = function(selector, context) {
		if (Object.prototype.toString.call(selector) === '[object Array]') {
			this.elements = selector;
		}
		else if (selector instanceof Dom) {
			this.elements = selector.elements;
		}
		else if ('string' === typeof selector) {
			if ('<' === selector.substr(0, 1)) {
				selector = selector.substr(0, selector.length-1).substr(1).replace('/', '');
				this.elements = [document.createElement(selector)];
			}
			else {
				if ('undefined' === typeof context) context = document;
				this.elements = context.querySelectorAll(selector);
			}
		}
		else {
			this.elements = [selector];
		}

		for (var i = 0; i < this.elements.length; i++) {
			if ('undefined' === typeof this.elements[i]['SwingDomId']) {
				this.elements[i]['SwingDomId'] = ++_i;
			}
		}

		this.length = this.elements.length;
	};

	var $ = Swing.$ = function(selector, context) {
		return new Dom(selector, context);
	};

	var _data = {}, _callbacks = {};

	Dom.prototype = {
		each: function(iterator, context) {
			return Swing.each(this.elements, iterator, context);
		},

		find: function(selector) {
			var elements = [];

			this.each(function(el) {
				$(selector, el).each(function(match) {
					if (!Swing.inArray(match, elements)) {
						elements.push(match);
					}
				});
			});

			return $(elements);
		},

		closest: function(selector) {
			var searchParent = function(node) {
				var matched = false;
				var parent = node.parentNode;
				if (!parent) return matched;

				$(selector, parent).each(function(el) {
					if (node == el) {
						matched = el;
						return false;
					}
				});

				if (matched) return matched;
				return searchParent(parent);
			};

			var elements = [], matched;

			this.each(function(el) {
				if (!el.parentNode) return;

				matched = searchParent(el.parentNode);
				if (matched) {
					elements.push(matched);
				}
			});

			return $(elements);
		},

		is: function(selector) {
			var matched = false;

			this.each(function(el) {
				if (!el.parentNode) return;
				if (matched) return false;

				$(selector, el.parentNode).each(function(node) {
					if (node == el) {
						matched = true;
						return false;
					}
				});
			});

			return matched;
		},

		attr: function(name, value) {
			if ('undefined' === typeof value) {
				if (!this.length) return null;
				return this.get(0).getAttribute(name);
			}

			this.each(function(el) {
				el.setAttribute(name, value);
			});

			return this;
		},

		prop: function(name, value) {
			if ('undefined' === typeof value) {
				if (!this.length) return null;
				return this.get(0)[name];
			}

			this.each(function(el) {
				el[name] = value;
			});

			return this;
		},

		val: function(value) {
			if ('undefined' === typeof value) {
				if (!this.length) return null;
				return this.get(0).value;
			}

			this.each(function(el) {
				el.value = value;
			});

			return this;
		},

		html: function(content) {
			if ('undefined' === typeof content) {
				if (!this.length) return '';
				return this.get(0).innerHTML;
			}

			this.each(function(el) {
				el.innerHTML = content;
			});

			return this;
		},

		css: function(name, value) {
			if ('undefined' === typeof value) {
				if (!this.length) return null;
				return this.get(0).style[name];
			}

			this.each(function(el) {
				el.style[name] = value;
			});

			return this;
		},

		show: function() {
			return this.css('display', '');
		},

		hide: function() {
			return this.css('display', 'none');
		},

		addClass: function(value) {
			this.each(function(el) {
				el.className = el.className + ' ' + value;
				el.className = el.className.replace(/^\s+|\s+$/g, '');
			});

			return this;
		},

		removeClass: function(value) {
			this.each(function(el) {
				var values = value.split(' ');
				for (var i = 0; i < values.length; i++) {
					el.className = el.className.replace(new RegExp('(?:^|\\s)'+values[i]+'(?!\\S)'), '');
					el.className = el.className.replace(/^\s+|\s+$/g, '');
				}
			});

			return this;
		},

		hasClass: function(value) {
			var found = false;

			this.each(function(el) {
				found = new RegExp('(\\s|^)' + value + '(\\s|$)').test(el.className);
				if (found) return false;
			});

			return found;
		},

		get: function(idx) {
			return this.elements[idx];
		},

		first: function() {
			return $(this.get(0));
		},

		last: function() {
			return $(this.get(this.length-1));
		},

		parent: function() {
			var parents = [];

			this.each(function(el) {
				parents.push(el.parentNode);
			});

			return $(parents);
		},

		clone: function() {
			var elements = [];

			this.each(function(el) {
				elements.push(el.cloneNode(true));
			});

			return $(elements);
		},

		append: function(el) {
			if (this.length) {
				$(el).each(Swing.bind(function(e) {
					this.get(0).appendChild(e);
				}, this));
			}

			return this;
		},

		appendTo: function(parent) {
			$(parent).append(this);

			return this;
		},

		insertAfter: function(sibling) {
			sibling = sibling instanceof Dom ? sibling.get(0) : sibling;

			this.each(function(el) {
				sibling.parentNode.insertBefore(el, sibling.nextSibling);
			});

			return this;
		},

		prepend: function(el) {
			if (this.length) {
				$(el).each(Swing.bind(function(e) {
					this.get(0).insertBefore(e, this.get(0).firstChild);
				}, this));
			}

			return this;
		},

		prependTo: function(parent) {
			$(parent).prepend(this);

			return this;
		},

		insertBefore: function(sibling) {
			sibling = sibling instanceof Dom ? sibling.get(0) : sibling;

			this.each(function(el) {
				sibling.parentNode.insertBefore(el, sibling);
			});

			return this;
		},

		remove: function() {
			this.each(function(el) {
				if (el.parentNode) el.parentNode.removeChild(el);
			});

			return this;
		},

		data: function(key, value) {
			this.each(function(el) {
				if ('undefined' !== typeof _data[el.SwingDomId]) return;
				_data[el.SwingDomId] = {};

				var attrs = el.attributes, i, name;
				for (i = 0; i < attrs.length; i++) {
					name = attrs[i].name;
					if (0 === name.indexOf('data-')) {
						_data[el.SwingDomId][name.slice(5)] = attrs[i].value;
					}
				}
			});

			if ('undefined' === typeof value) {
				if (this.length && 'undefined' !== typeof _data[this.get(0).SwingDomId][key]) {
					return _data[this.get(0).SwingDomId][key];
				}

				return null;
			}

			this.each(function(el) {
				_data[el.SwingDomId][key] = value;
			});

			return this;
		},

		on: function(event, selector, handler, context) {
			if ('string' !== typeof selector) {
				context = handler;
				handler = selector;
				selector = undefined;
			}

			this.each(function(el) {
				if ('undefined' !== typeof selector) {
					_callbacks[handler] = function(e) {
						if (e.target && Swing.inArray(e.target, $(selector, e.target.parentNode).elements)) {
							context = 'undefined' === typeof context ? this : context;
							handler.apply(context, arguments);
						}
					};
					Swing.on(el, event, _callbacks[handler]);
				}
				else {
					Swing.on(el, event, handler, context);
				}
			});

			return this;
		},

		off: function(event, handler) {
			this.each(function(el) {
				if (_callbacks[handler]) {
					Swing.off(el, event, _callbacks[handler]);
					delete _callbacks[handler];
				}
				else {
					Swing.off(el, event, handler);
				}
			});

			return this;
		},

		trigger: function(event) {
			this.each(function(el) {
				Swing.trigger(el, event);
			});

			return this;
		}
	};
})(window.Swing || (window.Swing = {}));

export default window.Swing.dom;
