// Requires: promise.js

(function(Swing) {
	Swing.ajax = function(options) {
		var url = options.url;
		options.type = options.type || 'GET';
		options.type =options.type.toUpperCase();
		options.headers = options.headers || {};
		options.headers['X-Requested-With'] = 'XMLHttpRequest';
		if (options.type != 'GET') options.headers['Content-type'] = 'application/x-www-form-urlencoded';
		
		var serialize = function(obj, prefix) {
			var str = [], p, k;
			for (p in obj) {
				k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
				str.push('object' === typeof v ? serialize(v, k) : encodeURIComponent(k)+'='+encodeURIComponent(v));
			}
			return str.join('&');
		};
		
		if (options.data && options.type == 'GET') {
			url += (url.indexOf('?') === -1) ? '?' : '&';
			url += serialize(options.data);
		}
		
		var XMLHttpRequest = window.XMLHttpRequest || undefined;
		if ('undefined' === typeof XMLHttpRequest) {
			XMLHttpRequest = function() {
				try {return new ActiveXObject('Msxml2.XMLHTTP.6.0');} catch(e) {}
				try {return new ActiveXObject('Msxml2.XMLHTTP.3.0');} catch(e) {}
				try {return new ActiveXObject('Msxml2.XMLHTTP');} catch(e) {}
				try {return new ActiveXObject('Microsoft.XMLHTTP');} catch(e) {}
				throw new Error('This browser does not support XMLHttpRequest.');
			};
		}
		
		var xhr = new XMLHttpRequest(), d = Swing.promise();
		
		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4) return;
			if (xhr.status == 200) {
				var ctype = xhr.getResponseHeader('Content-Type');
				if (ctype && ctype.indexOf('application/json') !== -1) d.resolve(JSON.parse(xhr.responseText), xhr);
				else d.resolve(xhr.responseText, xhr);
			}
			else d.reject(xhr);
		};
		
		xhr.open(options.type, url, true);
		
		for (var key in options.headers) {
			xhr.setRequestHeader(key, options.headers[key]);
		}
		
		(options.type == 'GET') ? xhr.send() : xhr.send(serialize(options.data));
		
		return d;
	};
})(window.Swing || (window.Swing = {}));
