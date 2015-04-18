// Requires: core.js

/*
USAGE
=====
Swing.messenger.success('Great success!');

INTEGRATING WITH TWITTER BOOTSTRAP
==================================
Add the following CSS:
```CSS
	.sw-messenger {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		text-align: center;
	}
	.sw-messenger div.alert {
		display: inline-block;
		min-width: 250px;
		margin: 0;
		padding: 10px 15px;
	}
```
*/

(function(Swing) {
	var _parent = null;
	
	var messenger = Swing.messenger = function(msg, options) {
		this.msg = msg;
		this.options = options || {};
		this.type = this.options.type || 'success';
	};
	
	messenger.prototype = {
		show: function(e) {
			var parent = this.parent();
			
			var message_el = document.createElement('div');
			message_el.innerHTML = '<div class="'+Swing.messenger.alert_class+' '+Swing.messenger[this.type+'_class']+'">'+this.msg+'</div>';
			
			parent.appendChild(message_el);
			
			var ttl = this.options.ttl || 5;
			
			setTimeout(function() {
				parent.removeChild(message_el);
			}, ttl * 1000);
		},
		
		parent: function() {
			if (!_parent) {
				if (Swing.messenger.el_target) {
					_parent = document.querySelector(Swing.messenger.el_target);
				}
				
				if (!_parent) {
					_parent = document.createElement('div');
					_parent.className = 'sw-messenger';
					document.body.appendChild(_parent);
				}
			}
			
			return _parent;
		}
	};
	
	Swing.messenger.success = function(msg, options) {
		var instance = new messenger(msg, Swing.extend({}, {
			type: 'success'
		}, options));
		instance.show();
	};
	
	Swing.messenger.error = function(msg, options) {
		var instance = new messenger(msg, Swing.extend({}, {
			type: 'error'
		}, options));
		instance.show();
	};
	
	Swing.messenger.el_target = null;
	Swing.messenger.alert_class = 'alert';
	Swing.messenger.success_class = 'alert-success';
	Swing.messenger.error_class = 'alert-danger';
})(window.Swing || (window.Swing = {}));
