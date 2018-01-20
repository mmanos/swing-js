// Requires: core.js, events.js

/*
USAGE
=====
var modal = Swing.modal('#mymodal');
modal.show();

INTEGRATING WITH TWITTER BOOTSTRAP
==================================
Add the following CSS:
```CSS
	.modal-backdrop {
		width: 100%;
		height: 100%;
		opacity: .5;
		-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";
	}
```

DOM example:
```HTML
	<div class="modal" id="mymodal" data-dismiss="swing.modal">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="swing.modal">&times;</button>
					<h4 class="modal-title">Modal title</h4>
				</div>
				<div class="modal-body">Modal body...</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="swing.modal">Close</button>
					<button type="button" class="btn btn-primary">Save</button>
				</div>
			</div>
		</div>
	</div>
```
*/

(function(Swing) {
	var _instances = {};
	
	var modal = function(el, options) {
		if ('undefined' !== typeof jQuery && el instanceof jQuery) {
			el = input.get(0);
		}
		else if ('undefined' !== typeof Swing.dom && el instanceof Swing.dom) {
			el = input.get(0);
		}
		else if ('string' === typeof el) {
			el = document.querySelector(el);
		}
		
		this.el = el;
		this.options = options || {};
		this.visible = false;
		
		Swing.each(this.el.querySelectorAll('[data-dismiss="swing.modal"]'), Swing.bind(function(el) {
			Swing.on(el, 'click', this.hide, this);
		}, this));
		
		if ('swing.modal' == this.el.getAttribute('data-dismiss') && !this.options.disable_backdrop_click) {
			Swing.on(this.el, 'click', function(e) {
				if (e.target == e.currentTarget) this.hide();
			}, this);
		}
		
		this.backdrop = document.createElement('div');
		this.backdrop.className = this.options.backdrop_class || 'modal-backdrop';
		
		if (!this.options.disable_backdrop_click) {
			Swing.on(this.backdrop, 'click', this.hide, this);
		}
	};
	
	modal.prototype = {
		show: function(e) {
			if (e) e.preventDefault();
			if (this.visible) return;
			
			this.visible = true;
			
			document.body.appendChild(this.backdrop);
			this.el.style.display = 'block';
			
			this.trigger('shown');
			
			return this;
		},
		
		hide: function(e) {
			if (e) e.preventDefault();
			if (!this.visible) return;
			
			this.visible = false;
			
			this.el.style.display = 'none';
			document.body.removeChild(this.backdrop);
			
			this.trigger('hidden');
			
			return this;
		}
	};
	
	Swing.modal = function(el, options, force_new) {
		if ('undefined' === typeof _instances[el] || force_new) {
			_instances[el] = new modal(el, options);
		}
		
		return _instances[el];
	};
	
	if (Swing.observable) Swing.observable(modal);
	else (Swing.queueObservable || (Swing.queueObservable = [])) && Swing.queueObservable.push(modal);
})(window.Swing || (window.Swing = {}));
