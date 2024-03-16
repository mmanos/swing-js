import './promise';

(function(Swing) {
	Swing.ajax = function(options) {
		var d = Swing.promise().resolve(options)
			.done(Swing.ajax.precheck)
			.done(Swing.ajax._makeRequest);
		Swing.ajax.postcheck(options, d);
		return d;
	};

	Swing.ajax._makeRequest = function(options) {
		if (options.response) return options.response;

		var url = options.url;
		options.type = options.type || 'GET';
		options.type = options.type.toUpperCase();
		options.headers = options.headers || {};
		options.headers['X-Requested-With'] = 'XMLHttpRequest';

		var serialize = function(obj, sep, eq, bo, bc, prefix) {
			sep = sep || '&';
			eq = eq || '=';
			bo = bo || '[';
			bc = bc || ']';
			obj = (obj === null) ? {} : obj;

			return Object.keys(obj).map(function(i) {
				var key = prefix ?
					prefix + bo + encodeURIComponent(i) + bc :
					encodeURIComponent(i);
				var value = obj[i] === null ? '' : obj[i];

				if (value instanceof RegExp) value = value.toString();

				switch (typeof value) {
					case 'object':
						if (Object.prototype.toString.call(value) === '[object Array]'
							&& (!value || !value.length)
						) {
							return key + eq;
						}
						return serialize(value, sep, eq, bo, bc, key);
					case 'undefined':
						return false;
					default:
						return key + eq + encodeURIComponent(value);
				}
			}).filter(function(i) { return i; }).join(sep);
		};

		var data = null;
		if (options.type == 'GET') {
			if (options.data) {
				url += (url.indexOf('?') === -1) ? '?' : '&';
				url += serialize(options.data);
			}
		}
		else {
			if (options.raw) {
				data = options.raw;
			}
			else if (options.files) {
				data = new FormData();

				for (var key in options.files) {
					data.append(key, options.files[key]);
				}

				if (options.data) {
					// PHP/Laravel only supports multipart content type data on POST requests.
					// The FormData always sends as multipart.
					if (options.type == 'POST') {
						for (var key in options.data) {
							data.append(key, options.data[key]);
						}
					}
					// For requests other than POST, send any request data as part
					// of the query string (not ideal).
					else {
						url += (url.indexOf('?') === -1) ? '?' : '&';
						url += serialize(options.data);
					}
				}
			}
			else if (options.json) {
				options.headers['Content-type'] = 'application/json';
				data = JSON.stringify(options.json);
			}
			else if (options.data) {
				options.headers['Content-type'] = 'application/x-www-form-urlencoded';
				data = serialize(options.data);
			}
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
			if (xhr.status >= 200 && xhr.status <= 299) {
				var ctype = xhr.getResponseHeader('Content-Type');
				if (ctype && ctype.indexOf('application/json') !== -1) d.resolve(JSON.parse(xhr.responseText), xhr);
				else d.resolve(xhr.responseText, xhr);
			}
			else d.reject(xhr);
		};

		if (options.onprogress) xhr.upload.onprogress = options.onprogress;

		xhr.open(options.type, url, true);

		for (var key in options.headers) {
			xhr.setRequestHeader(key, options.headers[key]);
		}

		xhr.send(data);

		return d;
	};

	Swing.ajax.precheck = function(options) {};
	Swing.ajax.postcheck = function(options, d) {};
})(window.Swing || (window.Swing = {}));

export default window.Swing.ajax;
