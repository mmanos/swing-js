// Requires: promise.js

(function(Swing) {
	var _assets = {};
	
	Swing.asset = function(url, type) {
		if ('undefined' !== typeof _assets[url]) {
			return _assets[url];
		}
		
		var d = Swing.promise();
		_assets[url] = d;
		
		if ('undefined' === typeof type) {
			type = (-1 !== url.indexOf('.js')) ? 'js' : 'css';
		}
		
		var el;
		if ('js' == type) {
			el       = document.createElement('script');
			el.type  = 'text/javascript';
			el.async = true;
			el.src   = url;
		}
		else {
			el      = document.createElement('link');
			el.type = 'text/css';
			el.rel  = 'stylesheet';
			el.href = url;
		}
		
		el.onreadystatechange = function() {
			if ('complete' !== this.readyState && 'loaded' !== this.readyState) {
				return;
			}
			
			if ('pending' == d.state) {
				setTimeout(d.resolve, 0);
			}
		};
		el.onload = function() {
			if ('pending' == d.state) {
				setTimeout(d.resolve, 0);
			}
		};
		
		(document.getElementsByTagName('head')[0]
			|| document.getElementsByTagName('body')[0]
		).appendChild(el);
		
		return d;
	};
})(window.Swing || (window.Swing = {}));
