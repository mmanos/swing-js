// Requires: core.js, validate.js

(function(Swing) {
	var getElement = function(el, selector) {
		while (-1 !== selector.indexOf('parent:')) {
			el = el.parentNode;
			selector = selector.replace('parent:', '');
		}
		return selector ? el.querySelector(selector) : el;
	};
	
	Swing.validateRendererBasic = function(validator) {
		this.validator = validator;
	};
	
	Swing.validateRendererBasic.prototype = {
		renderError: function(error, attribute, rule, parameters) {
			var form = this.validator.input;
			
			var el = form.querySelector('[name="'+attribute+'"]');
			if (form.querySelector('[data-validate-name="'+attribute+'"]')) {
				el = form.querySelector('[data-validate-name="'+attribute+'"]');
			}
			
			if (!el) return;
			
			var message_target = this._getMessageTarget(el);
			if (message_target) {
				message_target.innerHTML = error;
				if ('none' == message_target.style.display) {
					message_target.style.display = '';
					message_target.setAttribute('data-was-hidden', '1');
				}
			}
			
			var class_target = this._getClassTarget(el);
			if (class_target) {
				class_target.className = class_target.className + ' ' + this._getErrorClass(el);
				class_target.className = class_target.className.replace(/^\s+|\s+$/g, '');
			}
			
			el.setAttribute('data-validate-error', '1');
		},
		
		clear: function() {
			var form = this.validator.input;
			
			Swing.each(form.querySelectorAll('[data-validate-error="1"]'), Swing.bind(function(el) {
				var message_target = this._getMessageTarget(el);
				if (message_target) {
					message_target.innerHTML = '';
					
					if ('1' == message_target.getAttribute('data-was-hidden')) {
						message_target.style.display = 'none';
						message_target.setAttribute('data-was-hidden', null);
					}
				}
				
				var class_target = this._getClassTarget(el);
				if (class_target) {
					class_target.className = class_target.className
						.replace(new RegExp('(?:^|\\s)'+this._getErrorClass(el)+'(?!\\S)'), '')
						.replace(/^\s+|\s+$/g, '');
				}
				
				el.setAttribute('data-validate-error', null);
			}, this));
		},
		
		_getMessageTarget: function(el) {
			var selector = el.getAttribute('data-error-message-target')
				|| this.validator.input.getAttribute('data-error-message-target')
				|| 'parent:.help-block';
			
			return getElement(el, selector);
		},
		
		_getClassTarget: function(el) {
			var selector = el.getAttribute('data-error-class-target')
				|| this.validator.input.getAttribute('data-error-class-target')
				|| 'parent:';
			
			return getElement(el, selector);
		},
		
		_getErrorClass: function(el) {
			return el.getAttribute('data-error-class')
				|| this.validator.input.getAttribute('data-error-class')
				|| 'has-error';
		}
	};
	
	if (Swing.validator) Swing.validator.default_renderer = Swing.validateRendererBasic;
	else Swing.defaultValidationRenderer = Swing.validateRendererBasic;
})(window.Swing || (window.Swing = {}));
