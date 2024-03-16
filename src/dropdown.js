// Requires: core.js, events.js

/*
USAGE
=====
Swing.dropdown('#mydropdown');

INTEGRATING WITH TWITTER BOOTSTRAP
==================================
DOM example:
```HTML
	<div class="dropdown" id="mydropdown">
		<a href="#" class="dropdown-toggle" data-toggle="dropdown">
			View items <b class="caret"></b>
		</a>
		<ul class="dropdown-menu">
			<li><a href="/">Home</a></li>
			<li><a href="/account">Account</a></li>
		</ul>
	</div>
```
*/

(function(Swing) {
	var dropdown = function(el) {
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
		this.visible = false;

		var toggle_el = this.el.querySelector('[data-toggle="dropdown"]');
		if (toggle_el) {
			Swing.on(toggle_el, 'click', this.toggle, this);
		}

		Swing.on(this.el.querySelector('.dropdown-menu'), 'click', Swing.bind(function(e) {
			if (e.target
				&& !Swing.inArray(e.target, this.el.querySelectorAll('.dropdown-menu a'))
				&& !Swing.inArray(e.target, this.el.querySelectorAll('.dropdown-menu a *'))
			) {
				e.stopPropagation();
			}
		}, this));
	};

	dropdown.prototype = {
		toggle: function(e) {
			if (e) e.preventDefault();
			return this.visible ? this.hide() : this.show();
		},

		show: function(e) {
			if (e) e.preventDefault();
			if (e) e.stopPropagation();
			if (this.visible) return;

			this.visible = true;

			this.el.className = this.el.className + ' open';
			this.el.className = this.el.className.replace(/^\s+|\s+$/g, '');

			setTimeout(Swing.bind(function() {
				Swing.on(window, 'click', this.hide, this);
			}, this), 0);

			return this;
		},

		hide: function(e) {
			if (e) e.preventDefault();
			if (!this.visible) return;

			this.visible = false;

			this.el.className = this.el.className.replace(new RegExp('(?:^|\\s)'+'open'+'(?!\\S)'), '');
			this.el.className = this.el.className.replace(/^\s+|\s+$/g, '');

			Swing.off(window, 'click', this.hide);

			return this;
		}
	};

	Swing.dropdown = function(el) {
		return new dropdown(el);
	};
})(window.Swing || (window.Swing = {}));
