// Requires: core.js, promise.js, events.js

/*
USAGE
=====
Swing.alert('You must do something first...');
 OR
Swing.confirm('Are you sure?').done(...).fail(...);

INTEGRATING WITH TWITTER BOOTSTRAP
==================================
Add the following CSS:
```CSS
	.alert-backdrop {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		background-color: #000;
		width: 100%;
		height: 100%;
		opacity: .5;
		-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";
	}
```

DOM example:
```HTML
	<div class="modal sw-alert-template">
		<div class="modal-dialog modal-sm">
			<div class="modal-content">
				<div class="modal-body" data-placeholder="swing.alert.msg"></div>
				<div class="modal-footer" data-placeholder="swing.alert.btns"></div>
			</div>
		</div>
	</div>
```
*/

(function(Swing) {
	var alert = function(msg, options) {
		this.msg = msg;
		this.options = options || {};
		
		var template = this.options.template || document.querySelector(this.options.template_selector || Swing.alert.template_selector);
		if (!template) {
			if ('undefined' !== typeof console && console.log) {
				console.log('Swing.alert ERROR: missing required '+Swing.alert.template_selector+' DOM element.');
				return;
			}
		}
		
		this.promise = Swing.promise();
		this.visible = false;
		
		this.el = template.cloneNode(true);
		this.el.style.display = 'block';
		
		var msg_el = this.el.querySelector('[data-placeholder="swing.alert.msg"]');
		if (msg_el) {
			msg_el.innerHTML += this.msg;
		}
		
		var btns_el = this.el.querySelector('[data-placeholder="swing.alert.btns"]');
		if (btns_el) {
			if (this.options.btns_html) {
				btns_el.innerHTML = this.options.btns_html;
			}
			else if (this.options.btns) {
				var str = '';
				for (var i = 0; i < this.options.btns.length; i++) {
					var btn = this.options.btns[i];
					str += '&nbsp;<button class="btn ';
					if (btn.action && 'resolve' == btn.action) {
						str += (this.options.btn_resolve_class || Swing.alert.btn_resolve_class) + '" data-action="resolve"';
					}
					else {
						str += (this.options.btn_reject_class || Swing.alert.btn_reject_class) + '" data-action="reject"';
					}
					if (btn.value) {
						str += ' data-value="' + btn.value + '"';
					}
					str += '>' + btn.title + '</button>';
				}
				btns_el.innerHTML += str;
			}
		}
		
		Swing.each(this.el.querySelectorAll('[data-dismiss="swing.alert"]'), Swing.bind(function(el) {
			Swing.on(el, 'click', this.hide, this);
		}, this));
		
		if ('swing.alert' == this.el.getAttribute('data-dismiss')) {
			Swing.on(this.el, 'click', function(e) {
				if (e.target == e.currentTarget) this.hide();
			}, this);
		}
		
		Swing.each(this.el.querySelectorAll('[data-action="resolve"]'), Swing.bind(function(el) {
			Swing.on(el, 'click', this.resolve, this);
		}, this));
		Swing.each(this.el.querySelectorAll('[data-action="reject"]'), Swing.bind(function(el) {
			Swing.on(el, 'click', this.reject, this);
		}, this));
		
		this.backdrop = null;
		if (!this.options.disable_backdrop) {
			this.backdrop = document.createElement('div');
			this.backdrop.className = this.options.backdrop_class || 'alert-backdrop';
			
			if (this.options.enable_backdrop_click) {
				Swing.on(this.backdrop, 'click', this.hide, this);
			}
		}
	};
	
	alert.prototype = {
		show: function(e) {
			if (e) e.preventDefault();
			if (this.visible) return;
			
			this.visible = true;
			
			if (this.backdrop) {
				document.body.appendChild(this.backdrop);
			}
			
			document.body.appendChild(this.el);
			
			return this;
		},
		
		hide: function(e) {
			if (e) e.preventDefault();
			if (!this.visible) return;
			
			this.visible = false;
			
			document.body.removeChild(this.el);
			
			if (this.backdrop) {
				document.body.removeChild(this.backdrop);
			}
			
			return this;
		},
		
		resolve: function(e) {
			var value = null;
			if (e) {
				e.preventDefault();
				var target = e.currentTarget || e.target;
				value = target ? target.getAttribute('data-value') : null;
			}
			
			this.hide();
			if ('pending' == this.promise.state) this.promise.resolve(value ? value : undefined);
			return this;
		},
		
		reject: function(e) {
			if (e) e.preventDefault();
			this.hide();
			if ('pending' == this.promise.state) this.promise.reject();
			return this;
		}
	};
	
	Swing.alert = function(msg, options) {
		var instance = new alert(msg, Swing.extend({}, {
			btns: [{title:'OK', action:'resolve'}]
		}, options));;
		instance.show();
		return instance.promise;
	};
	
	Swing.confirm = function(msg, options) {
		var instance = new alert(msg, Swing.extend({}, {
			btns: [{title:'Cancel', action:'reject'}, {title:'OK', action:'resolve'}]
		}, options));;
		instance.show();
		return instance.promise;
	};
	
	Swing.alert.template_selector = '.sw-alert-template';
	Swing.alert.btn_resolve_class = 'btn-primary';
	Swing.alert.btn_reject_class = 'btn-default';
})(window.Swing || (window.Swing = {}));
