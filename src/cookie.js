// Requires: <none>

(function(Swing) {
	Swing.cookie = {
		get: function(name) {
			var result = {};
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			
			for (var i = 0; i < cookies.length; i++) {
				var parts       = cookies[i].split('=');
				var cookie_name = decodeURIComponent(parts.shift());
				var cookie      = parts.join('=');
				
				if (cookie.indexOf('"') === 0) {
					// This is a quoted cookie as according to RFC2068, unescape...
					cookie = cookie.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
				}
				
				try {
					// Replace server-side written pluses with spaces.
					// If we can't decode the cookie, ignore it, it's unusable.
					// If we can't parse the cookie, ignore it, it's unusable.
					cookie = decodeURIComponent(cookie.replace(/\+/g, ' '));
					result[cookie_name] = JSON.parse(cookie);
				} catch(e) {
					result[cookie_name] = cookie;
				}
			}
			
			if (!name) {
				return result;
			}
			
			if ('undefined' !== typeof result[name]) {
				return result[name];
			}
			
			return null;
		},
		
		put: function(name, value, options) {
			options || (options = {});
			
			if ('number' === typeof options.expires) {
				var minutes = options.expires, t = options.expires = new Date();
				t.setTime(+t + minutes * 60 * 1000);
			}
			
			document.cookie = [
				encodeURIComponent(name), '=', encodeURIComponent(JSON.stringify(value)),
				options.expires ? '; expires=' + options.expires.toUTCString() : '',
				options.path ? '; path=' + options.path : '',
				options.domain ? '; domain=' + options.domain : '',
				options.secure ? '; secure' : ''
			].join('');
		},
		
		has: function(name) {
			return null !== this.get(name);
		},
		
		forget: function(name) {
			if (!this.has(name)) {
				return;
			}
			
			this.put(name, '', {expires:-1440});
		}
	};
})(window.Swing || (window.Swing = {}));

export default window.Swing.cookie;
