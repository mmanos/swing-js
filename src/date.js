// Requires: <none>

(function(Swing) {
	var i18n = {
		dayNames: [
			'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
			'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
		],
		monthNames: [
			'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
			'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
		]
	};
	
	var masks = {
		'default':      'mmm dd, yyyy h:MMtt',
		original:       'ddd mmm dd yyyy HH:MM:ss',
		shortDate:      'm/d/yy',
		mediumDate:     'mmm d, yyyy',
		longDate:       'mmmm d, yyyy',
		fullDate:       'dddd, mmmm d, yyyy',
		shortTime:      'h:MM TT',
		mediumTime:     'h:MM:ss TT',
		longTime:       'h:MM:ss TT Z',
		isoDate:        'yyyy-mm-dd',
		isoTime:        'HH:MM:ss',
		isoDateTime:    'yyyy-mm-dd"T"HH:MM:ss',
		isoUtcDateTime: 'UTC:yyyy-mm-dd"T"HH:MM:ss"Z"'
	};
	
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function(val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = '0' + val;
			return val;
		};
	
	var _date = function(date, utc) {
		if (date && date % 1 === 0) this.date = date < 2147483640 ? new Date(date*1000) : new Date(date);
		else if (date && 'string' === typeof date) this.date = new Date(date);
		else if (date instanceof Date) this.date = date;
		else this.date = new Date();
		
		this.utc = utc ? true : false;
	};
	_date.prototype = {
		get: function(unit) {
			var fn;
			if ('milliseconds' == unit) fn = this.utc ? 'getUTCMilliseconds' : 'getMilliseconds';
			else if ('seconds' == unit) fn = this.utc ? 'getUTCSeconds' : 'getSeconds';
			else if ('minutes' == unit) fn = this.utc ? 'getUTCMinutes' : 'getMinutes';
			else if ('hours' == unit) fn = this.utc ? 'getUTCHours' : 'getHours';
			else if ('day' == unit) fn = this.utc ? 'getUTCDay' : 'getDay';
			else if ('date' == unit) fn = this.utc ? 'getUTCDate' : 'getDate';
			else if ('month' == unit) fn = this.utc ? 'getUTCMonth' : 'getMonth';
			else if ('year' == unit) fn = this.utc ? 'getUTCFullYear' : 'getFullYear';
			else return null;
			
			return this.date[fn]();
		},
		
		set: function(unit, value) {
			var fn;
			if ('milliseconds' == unit) fn = this.utc ? 'setUTCMilliseconds' : 'setMilliseconds';
			else if ('seconds' == unit) fn = this.utc ? 'setUTCSeconds' : 'setSeconds';
			else if ('minutes' == unit) fn = this.utc ? 'setUTCMinutes' : 'setMinutes';
			else if ('hours' == unit) fn = this.utc ? 'setUTCHours' : 'setHours';
			else if ('day' == unit) fn = this.utc ? 'setUTCDay' : 'setDay';
			else if ('date' == unit) fn = this.utc ? 'setUTCDate' : 'setDate';
			else if ('month' == unit) fn = this.utc ? 'setUTCMonth' : 'setMonth';
			else if ('year' == unit) fn = this.utc ? 'setUTCFullYear' : 'setFullYear';
			else return this;
			
			this.date[fn](value);
			
			return this;
		},
		
		valueOf: function() {
			return this.date.getTime();
		},
		
		unix: function() {
			return this.date.getTime()/1000;
		},
		
		from: function(date, verbose) {
			var val,
				str,
				seconds = (date.getTime() - this.date.getTime()) / 1000;
			
			if (seconds < 0) return verbose ? 'just now' : '0s';
			
			if (seconds > 29808000) {val = Math.round(seconds / 31536000); str = verbose ? ' year' : 'y';}
			else if (seconds > 2160000) {val = Math.round(seconds / 2592000); str = verbose ? ' month' : 'mo';}
			else if (seconds > 79200) {val = Math.round(seconds / 86400); str = verbose ? ' day' : 'd';}
			else if (seconds > 2700) {val = Math.round(seconds / 3600); str = verbose ? ' hour' : 'h';}
			else if (seconds > 45) {val = Math.round(seconds / 60); str = verbose ? ' minute' : 'm';}
			else {val = seconds; str = verbose ? ' second' : 's';}
			
			str += (verbose && val != 1) ? 's' : '';
			
			return val + str;
		},
		
		fromNow: function(verbose) {
			return this.from(new Date(), verbose);
		},
		
		format: function(mask) {
			mask = String(masks[mask] || mask || masks['default']);
			
			var	_ = this.utc ? 'getUTC' : 'get',
				d = this.date[_ + 'Date'](),
				D = this.date[_ + 'Day'](),
				m = this.date[_ + 'Month'](),
				y = this.date[_ + 'FullYear'](),
				H = this.date[_ + 'Hours'](),
				M = this.date[_ + 'Minutes'](),
				s = this.date[_ + 'Seconds'](),
				L = this.date[_ + 'Milliseconds'](),
				o = this.utc ? 0 : this.date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  i18n.dayNames[D],
					dddd: i18n.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  i18n.monthNames[m],
					mmmm: i18n.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? 'a'  : 'p',
					tt:   H < 12 ? 'am' : 'pm',
					T:    H < 12 ? 'A'  : 'P',
					TT:   H < 12 ? 'AM' : 'PM',
					Z:    this.utc ? 'UTC' : (String(this.date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
					o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};
			
			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		},
		
		isValid: function() {
			return !isNaN(this.date.getTime());
		}
	};
	
	Swing.date = function(date) {
		return new _date(date);
	};
	
	Swing.date.utc = function(date) {
		return new _date(date, true);
	};
})(window.Swing || (window.Swing = {}));
