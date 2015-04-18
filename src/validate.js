// Requires: core.js, promise.js

(function(Swing) {
	/**
	 * Create a new validator instance.
	 *
	 * @param input    Swing.dom|jQuery|DOMElement|Object Input data.
	 * @param rules    {}                                 Validation rules for each field.
	 * @param messages {}                                 Optional custom error messages.
	 * @param data     {}                                 Optional data accessible by validators.
	 */
	Swing.validator = function(input, rules, messages, data) {
		if ('undefined' === typeof input) {
			throw new Error('Missing required input parameter in Swing.validator.');
		}
		if ('undefined' === typeof rules) rules = {};
		if ('undefined' === typeof messages) messages = {};
		if ('undefined' === typeof data) data = {};
		
		if ('undefined' !== typeof jQuery && input instanceof jQuery) {
			input = input.get(0);
		}
		else if ('undefined' !== typeof Swing.dom && input instanceof Swing.dom) {
			input = input.get(0);
		}
		
		this.input    = input;
		this.rules    = rules;
		this.messages = Swing.extend({}, Swing.validator.default_messages, messages);
		this._data    = data;
		this._errors  = {};
		this.renderer = null;
		
		this.checkInputForRules();
		
		if (Swing.validator.default_renderer && this.input.querySelector) {
			this.renderer = new Swing.validator.default_renderer(this);
		}
	};
	
	/**
	 * All of the registered validation rules.
	 */
	Swing.validator.validation_rules = {};
	
	/**
	 * The default error messages.
	 */
	Swing.validator.default_messages = {};
	
	/**
	 * The error renderer object to be used by validator instances.
	 */
	Swing.validator.default_renderer = Swing.defaultValidationRenderer || null;
	
	/**
	 * Create and return a new validator instance.
	 */
	Swing.validator.make = function(input, rules, messages, data) {
		return new Swing.validator(input, rules, messages, data);
	};
	
	/**
	 * Register a validation rule.
	 */
	Swing.validator.extend = function(rule, fn, default_message) {
		Swing.validator.validation_rules[rule] = fn;
		
		if ('undefined' !== typeof default_message && default_message) {
			Swing.validator.default_messages[rule] = default_message;
		}
	};
	
	Swing.validator.prototype = {
		/**
		 * Get or set a custom data attribute.
		 */
		data: function(key, value) {
			if ('undefined' === typeof value) {
				return 'undefined' !== typeof this._data[key] ? this._data[key] : null;
			}
			
			this._data[key] = value;
			return this;
		},
		
		/**
		 * Get the error messages for this validator.
		 */
		errors: function(field) {
			if ('undefined' !== typeof field) {
				return 'undefined' !== typeof this._errors[field] ? this._errors[field] : null;
			}
			
			return this._errors;
		},
		
		/**
		 * Determine if the data passes the validation rules.
		 */
		check: function() {
			// Clear existing errors.
			this._errors = {};
			
			if (this.renderer) {
				this.renderer.clear();
			}
			
			var promises = [];
			
			// Process each rule.
			Swing.each(this.rules, Swing.bind(function(rules, attribute) {
				rules = rules.split('|');
				
				for (var i = 0; i < rules.length; i++) {
					if (!rules[i]) continue;
					
					promises.push(this.validate(attribute, rules[i]));
				}
			}, this));
			
			var d = Swing.promise();
			
			Swing.when(promises).done(Swing.bind(function() {
				d.resolve(this);
			}, this)).fail(Swing.bind(function() {
				d.reject(this);
			}, this));
			
			return d;
		},
		
		/**
		 * Validate a given attribute against a rule.
		 */
		validate: function(attribute, rule) {
			var parsed     = this.parseRule(rule),
				parameters = parsed.parameters,
				value      = this.getValue(attribute);
			
			rule = parsed.rule;
			
			// Make sure this is a valid rule.
			if ('undefined' === typeof Swing.validator.validation_rules[rule]) {
				throw new Error('Validation rule "'+rule+'" does not exist.');
			}
			
			// Create a resolved deferred (will get overridden if is_validatable below).
			var d = Swing.promise().resolve();
			
			// Determine if the attribute is validatable.
			var is_validatable = Swing.bind(Swing.validator.validation_rules['required'], this)(attribute, value) || 'required' == rule;
			
			// Run validator rule, if possible.
			if (is_validatable) {
				var fn = Swing.bind(Swing.validator.validation_rules[rule], this);
				d = fn(attribute, value, parameters);
				
				// Auto-resolve non-deferreds based on their response.
				if (!d
					|| 'undefined' === typeof d.resolve
					|| 'undefined' === typeof d.then
				) {
					d = d ? Swing.promise().resolve() : Swing.promise().reject();
				}
			}
			
			// Listen for errors.
			d.fail(Swing.bind(function() {
				this.addError(attribute, rule, parameters, value);
			}, this));
			
			return d;
		},
		
		/**
		 * Get the value of a given attribute.
		 */
		getValue: function(attribute) {
			if ('undefined' !== typeof this.input.querySelector) {
				var found;
				if (found = this.input.querySelector('[data-validate-name="'+attribute+'"]')) {
					return found.value;
				}
				if (found = this.input.querySelector('[name="'+attribute+'"]')) {
					return found.value;
				}
			}
			else if ('object' === typeof this.input && this.input[attribute]) {
				return this.input[attribute];
			}
			
			return null;
		},
		
		/**
		 * Add an error message for this validator.
		 */
		addError: function(attribute, rule, parameters, value) {
			// Return if we already have an error for this attribute.
			if ('undefined' !== typeof this._errors[attribute]) {
				return;
			}
			
			var error = 'Failed rule '+rule+'.';
			
			if ('undefined' !== typeof this.messages[rule]) {
				if ('object' === typeof this.messages[rule]) {
					if (Swing.isNumeric(value) && this.messages[rule].numeric) {
						error = this.messages[rule].numeric;
					}
					else if ('string' === typeof value && this.messages[rule].string) {
						error = this.messages[rule].string;
					}
				}
				else {
					error = this.messages[rule];
				}
				
				if ('undefined' !== typeof parameters) {
					for (var i = 0; i < 5; i++) {
						if ('undefined' !== typeof parameters[i]) {
							error = error.replace(':param'+i, parameters[i]);
						}
					}
				}
			}
			
			this._errors[attribute] = error;
			
			if (this.renderer) {
				this.renderer.renderError(error, attribute, rule, parameters);
			}
		},
		
		/**
		 * Extract the rule name and parameters from a rule.
		 */
		parseRule: function(rule) {
			var parameters = [],
				colon;
			
			if ((colon = rule.indexOf(':')) !== -1) {
				parameters = rule.substr(colon + 1).split(',');
			}
			
			return {
				rule       : (-1 !== colon) ? rule.substr(0, colon) : rule,
				parameters : parameters
			};
		},
		
		/**
		 * If this.input is a DOM element, check for rules defined by data attributes.
		 */
		checkInputForRules: function() {
			if (!this.input.querySelectorAll) return;
			
			Swing.each(this.input.querySelectorAll('[data-validate]'), Swing.bind(function(el) {
				var name = el.getAttribute('data-validate-name') || el.getAttribute('name');
				if (!name) return;
				
				this.rules[name] || (this.rules[name] = '');
				this.rules[name] += '|'+el.getAttribute('data-validate');
				if (0 === this.rules[name].indexOf('|')) this.rules[name] = this.rules[name].substr(1);
			}, this));
		}
	};
	
	/**
	 * Helper method to validate a form submission.
	 * Eg: onclick="return Swing.validate(this)"
	 */
	Swing.validate = function(form) {
		if (form.getAttribute('data-validated')) return true;
		
		Swing.validator.make(form).check().done(Swing.bind(function() {
				form.setAttribute('data-validated', '1');
				form.submit();
			}, this));
		
		return false;
	};
	
	///////////////////////////////////////////////////////////////////////////
	// VALIDATION RULES ///////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	/**
	 * Validate that a required attribute exists.
	 */
	Swing.validator.extend('required', function(attribute, value) {
		if ('undefined' === typeof value || null === value) return false;
		else if ('string' === typeof value && '' === value) return false;
		return true;
	}, 'This field is required.');
	
	/**
	 * Validate that an attribute is numeric.
	 */
	Swing.validator.extend('numeric', function(attribute, value) {
		return Swing.isNumeric(value);
	}, 'This field must be a number.');
	
	/**
	 * Validate that an attribute is an integer.
	 */
	Swing.validator.extend('integer', function(attribute, value) {
		return value % 1 === 0;
	}, 'This field must be an integer.');
	
	/**
	 * Validate that an attribute is a string.
	 */
	Swing.validator.extend('string', function(attribute, value) {
		return 'string' === typeof value && !Swing.isNumeric(value);
	}, 'This field must be a string.');
	
	/**
	 * Validate the string length of an attribute is greater than a minimum value.
	 */
	Swing.validator.extend('min', function(attribute, value, parameters) {
		if (Swing.isNumeric(value)) {
			return Number(value) >= Number(parameters[0]);
		}
		
		value = '' + value + '';
		return value.length >= parameters[0];
	}, {numeric: 'This field must be at least :param0.', string: 'This field must be at least :param0 characters.'});
	
	/**
	 * Validate the string length of an attribute is less than a maximum value.
	 */
	Swing.validator.extend('max', function(attribute, value, parameters) {
		if (Swing.isNumeric(value)) {
			return Number(value) <= Number(parameters[0]);
		}
		
		value = '' + value + '';
		return value.length <= parameters[0];
	}, {numeric: 'This field may not be greater than :param0.', string: 'This field may not be greater than :param0 characters.'});
	
	/**
	 * Validate the length of an attribute is equal to a value.
	 */
	Swing.validator.extend('size', function(attribute, value, parameters) {
		if (Swing.isNumeric(value)) {
			return Number(value) == Number(parameters[0]);
		}
		
		value = '' + value + '';
		return value.length == parameters[0];
	}, {numeric: 'This field must be :param0.', string: 'This field must be :param0 characters.'});
	
	/**
	 * Validate the string is in email format.
	 */
	Swing.validator.extend('email', function(attribute, value, parameters) {
		var pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
		return value.match(pattern);
	}, 'This field must be a valid email address.');
	
	/**
	 * Validate the value is one of the given acceptible answers.
	 */
	Swing.validator.extend('in', function(attribute, value, parameters) {
		return Swing.inArray(value, parameters);
	}, 'This field is invalid.');
})(window.Swing || (window.Swing = {}));
