// Requires: core.js

(function(Swing) {
	var hasClass = function(el, value) {
		var found = new RegExp('(\\s|^)' + value + '(\\s|$)').test(el.className);
		return found ? true : false;
	};
	var addClass = function(el, value) {
		el.className = el.className + ' ' + value;
		el.className = el.className.replace(/^\s+|\s+$/g, '');
	};
	var removeClass = function(el, value) {
		el.className = el.className.replace(new RegExp('(?:^|\\s)'+value+'(?!\\S)'), '');
		el.className = el.className.replace(/^\s+|\s+$/g, '');
	};
	
	Swing.resizer = {
		init: function() {
			if (Swing.resizer._init) return;
			Swing.resizer._init = true;
			
			if (window.addEventListener) window.addEventListener('resize', Swing.resizer.handleResizeEvent);
			else window.attachEvent('onresize', Swing.resizer.handleResizeEvent);
		},
		
		handleResizeEvent: function(event) {
			Swing.each(document.querySelectorAll('.swing-fullheight'), Swing.resizer.fullHeight);
		},
		
		fullHeight: function(el, padding_bottom) {
			Swing.resizer.init();
			
			if ('string' === typeof el) el = document.querySelector(el);
			else if ('undefined' !== typeof Swing.dom && el instanceof Swing.dom) el = el.get(0);
			if (!el) return;
			
			var offsets = el.getBoundingClientRect();
			var height = el.clientHeight;
			height += el.style.borderTopWidth ? parseInt(el.style.borderTopWidth.replace('px', '')) : 0;
			height += el.style.borderBottomWidth ? parseInt(el.style.borderBottomWidth.replace('px', '')) : 0;
			var offset = offsets.top + (el.offsetHeight - height);
			
			if ('undefined' !== typeof padding_bottom) {
				el.setAttribute('data-swing-fullheight-padding-bottom', padding_bottom);
				offset += padding_bottom;
			}
			else if (el.getAttribute('data-swing-fullheight-padding-bottom')) {
				offset += el.getAttribute('data-swing-fullheight-padding-bottom');
			}
			
			addClass(el, 'swing-fullheight');
			el.style.height = (window.innerHeight - offset) + 'px';
		},
		
		clear: function(el) {
			if ('string' === typeof el) el = document.querySelector(el);
			else if ('undefined' !== typeof Swing.dom && el instanceof Swing.dom) el = el.get(0);
			if (!el) return;
			
			if (!hasClass(el, 'swing-fullheight')) return;
			
			removeClass(el, 'swing-fullheight');
			el.setAttribute('data-swing-fullheight-padding-bottom', null);
			el.style.height = '';
		}
	};
})(window.Swing || (window.Swing = {}));
