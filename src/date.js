import './core';

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
		isoDateTime:    'yyyy-mm-dd HH:MM:ss',
		isoUtcDateTime: 'yyyy-mm-dd"T"HH:MM:ss"Z"'
	};

	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function(val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = '0' + val;
			return val;
		},
		round = function(val, precision) {
			var multiplier = Math.pow(10, precision || 0);
			return Math.round(val * multiplier) / multiplier;
		},
		normalizeUnits = function(unit) {
			if (!unit) return unit;

			if (1 === unit.length) {
				switch (unit) {
					case 'y': case 'Y': return 'year';
					case 'M': return 'month';
					case 'd': case 'D': return 'date';
					case 'h': case 'H': return 'hour';
					case 'm': return 'minute';
					case 's': case 'S': return 'second';
					case 'ms': case 'mS': case 'Ms': case 'MS': return 'millisecond';
					default: return unit;
				}
			}

			unit = unit.toLowerCase();
			if ('s' === unit.charAt(unit.length - 1)) {
				unit = unit.substr(0, unit.length - 1);
			}

			return unit;
		},
		createFromFormat = function(date, format) {
			var monthNames = i18n.monthNames.slice(12);
			var monthAbbreviations = i18n.monthNames.slice(0, 12);
			var dayNames = i18n.dayNames.slice(7);
			var dayAbbreviations = i18n.dayNames.slice(0, 7);
			var formatParts = format.match(/YYYY|YY|MMMM|MMM|MM|M|DD|Do|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|A|a/g);
			const dateParts = date.match(new RegExp([
				'\\d+(?:st|nd|rd|th)?', 'am', 'pm', 'AM', 'PM',
				...monthNames, ...monthAbbreviations,
				...monthNames.map(m => m.toLowerCase()), ...monthAbbreviations.map(m => m.toLowerCase()),
				...monthNames.map(m => m.toUpperCase()), ...monthAbbreviations.map(m => m.toUpperCase()),
				...dayNames, ...dayAbbreviations,
				...dayNames.map(d => d.toLowerCase()), ...dayAbbreviations.map(d => d.toLowerCase()),
				...dayNames.map(d => d.toUpperCase()), ...dayAbbreviations.map(d => d.toUpperCase())
			].join('|'), 'g'));
			var currentDate = new Date();
			var result = {year:currentDate.getFullYear(), month:currentDate.getMonth(), day:currentDate.getDate(), hours:0, minutes:0, seconds:0, dayOfWeek:null};
			var isPM = false;

			for (var i = 0; i < formatParts.length; i++) {
				var part = formatParts[i], value = dateParts[i];
				switch (part) {
					case 'YYYY': result.year = parseInt(value, 10); break;
					case 'YY': result.year = parseInt(value, 10) + 2000; break;
					case 'MMMM': result.month = monthNames.findIndex(month => month.toLowerCase() === value.toLowerCase()); break;
					case 'MMM': result.month = monthAbbreviations.findIndex(month => month.toLowerCase() === value.toLowerCase()); break;
					case 'MM': case 'M': result.month = parseInt(value, 10) - 1; break;
					case 'DD': case 'D': result.day = parseInt(value, 10); break;
					case 'Do': result.day = parseInt(value, 10); break;
					case 'dddd': result.dayOfWeek = dayNames.findIndex(day => day.toLowerCase() === value.toLowerCase()); break;
					case 'ddd': result.dayOfWeek = dayAbbreviations.findIndex(day => day.toLowerCase() === value.toLowerCase()); break;
					case 'HH': case 'H': result.hours = parseInt(value, 10); break;
					case 'hh': case 'h': result.hours = parseInt(value, 10) % 12; break;
					case 'mm': case 'm': result.minutes = parseInt(value, 10); break;
					case 'ss': case 's': result.seconds = parseInt(value, 10); break;
					case 'A': case 'a': isPM = value && value.toLowerCase() === 'pm'; break;
				}
			}

			if (isPM && result.hours < 12) result.hours += 12;
			else if (!isPM && result.hours === 12) result.hours = 0;

			return new Date(result.year, result.month, result.day, result.hours, result.minutes, result.seconds);
		};

	var _date = Swing.date = function(date, utc, format) {
		if (!(this instanceof _date)) return new _date(date, utc, format);

		if ('string' === typeof utc && !format) {
			format = utc;
			utc = undefined;
		}

		if (date && date % 1 === 0) this._d = date < 2147483640 ? new Date(date*1000) : new Date(date);
		else if (date && 'string' === typeof date && format) this._d = createFromFormat(date, format);
		else if (date && 'string' === typeof date && !format) this._d = new Date(date);
		else if (date instanceof Date) this._d = date;
		else if (date instanceof _date) this._d = new Date(date.valueOf(), date.utc);
		else this._d = new Date();

		this.utc = utc ? true : false;
		this._timezone = utc ? 'UTC'
			: (window.Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : null);
	};
	_date.prototype = {
		get: function(unit) {
			switch (normalizeUnits(unit)) {
				case 'millisecond' : return this.millisecond();
				case 'second' : return this.second();
				case 'minute' : return this.minute();
				case 'hour' : return this.hour();
				case 'date' : return this.date();
				case 'day' : return this.day();
				case 'week' : return this.week();
				case 'month' : return this.month();
				case 'year' : return this.year();
				default: return null;
			}
		},

		set: function(unit, val) {
			switch (normalizeUnits(unit)) {
				case 'millisecond' : return this.millisecond(val);
				case 'second' : return this.second(val);
				case 'minute' : return this.minute(val);
				case 'hour' : return this.hour(val);
				case 'date' : return this.date(val);
				case 'day' : return this.day(val);
				case 'week' : return this.week(val);
				case 'month' : return this.month(val);
				case 'year' : return this.year(val);
				default: return this;
			}
		},

		millisecond: function(val) {
			if ('undefined' === typeof val) return this.utc ? this._d.getUTCMilliseconds() : this._d.getMilliseconds();
			this.utc ? this._d.setUTCMilliseconds(val) : this._d.setMilliseconds(val); return this;
		},
		milliseconds: function() {return this.millisecond.apply(this, arguments);},

		second: function(val) {
			if ('undefined' === typeof val) return this.utc ? this._d.getUTCSeconds() : this._d.getSeconds();
			this.utc ? this._d.setUTCSeconds(val) : this._d.setSeconds(val); return this;
		},
		seconds: function() {return this.second.apply(this, arguments);},

		minute: function(val) {
			if ('undefined' === typeof val) return this.utc ? this._d.getUTCMinutes() : this._d.getMinutes();
			this.utc ? this._d.setUTCMinutes(val) : this._d.setMinutes(val); return this;
		},
		minutes: function() {return this.minute.apply(this, arguments);},

		hour: function(val) {
			if ('undefined' === typeof val) return this.utc ? this._d.getUTCHours() : this._d.getHours();
			this.utc ? this._d.setUTCHours(val) : this._d.setHours(val); return this;
		},
		hours: function() {return this.hour.apply(this, arguments);},

		date: function(val) {
			if ('undefined' === typeof val) return this.utc ? this._d.getUTCDate() : this._d.getDate();
			this.utc ? this._d.setUTCDate(val) : this._d.setDate(val); return this;
		},
		dates: function() {return this.date.apply(this, arguments);},

		day: function(val) {
			var day = this.utc ? this._d.getUTCDay() : this._d.getDay();
			if ('undefined' === typeof val) return day;
			return this.date(this.date() + val - day);
		},
		days: function() {return this.day.apply(this, arguments);},

		week: function(val) {
			var start_of_year = this.clone().startOf('year');
			var week = Math.ceil((((this._d - start_of_year._d) / 86400000) + start_of_year.day())/7);
			if ('undefined' === typeof val) return week;
			return this.date(this.date() + ((val - week) * 7));
		},
		weeks: function() {return this.week.apply(this, arguments);},

		month: function(val) {
			if ('undefined' === typeof val) return this.utc ? this._d.getUTCMonth() : this._d.getMonth();
			this.utc ? this._d.setUTCMonth(val) : this._d.setMonth(val); return this;
		},
		months: function() {return this.month.apply(this, arguments);},

		year: function(val) {
			if ('undefined' === typeof val) return this.utc ? this._d.getUTCFullYear() : this._d.getFullYear();
			this.utc ? this._d.setUTCFullYear(val) : this._d.setFullYear(val); return this;
		},
		years: function() {return this.year.apply(this, arguments);},

		timezone: function(val) {
			if ('undefined' === typeof val) return this._timezone || this.format('Z');
			var now = new Date();
			var utcD = _date(new Date(now.toLocaleString('en-US', {timeZone: 'UTC'})));
			var curDiff = utcD.diff(new Date(now.toLocaleString('en-US', {timeZone: this._timezone})), 'minute', true);
			var newDiff = utcD.diff(new Date(now.toLocaleString('en-US', {timeZone: val})), 'minute', true);
			this._timezone = val; this.add(curDiff - newDiff, 'minutes'); return this;
		},

		add: function(amount, unit) {
			unit = normalizeUnits(unit);
			if ('day' == unit) unit = 'date';
			return this.set(unit, this.get(unit) + amount);
		},

		subtract: function(amount, unit) {
			return this.add(amount * -1, unit);
		},

		startOf: function(unit) {
			unit = normalizeUnits(unit);

			var units = ['month', 'day', 'week', 'hour', 'minute', 'second', 'millisecond'];

			if ('week' == unit) this.date(this.date() - this.day());

			var found = (unit == 'year');
			for (var i = 0; i < units.length; i++) {
				if (found) {
					switch (units[i]) {
						case 'month': this.month(0); break;
						case 'day': this.date(1); break;
						case 'hour': this.hour(0); break;
						case 'minute': this.minute(0); break;
						case 'second': this.second(0); break;
						case 'millisecond': this.millisecond(0); break;
					}
				}
				else if (units[i] == unit) found = true;
			}

			return this;
		},

		endOf: function(unit) {
			unit = normalizeUnits(unit);
			var set_unit = 'day' == unit ? 'date' : unit;

			return this.startOf(unit)
				.set(set_unit, this.get(set_unit) + 1)
				.subtract(1, 'millisecond');
		},

		diff: function(from, unit, precise) {
			var diff = this.valueOf() - _date(from).valueOf();

			switch (normalizeUnits(unit)) {
				case 'year': diff = diff / 1000 / 60 / 60 / 24 / 365; break;
				case 'month': diff = diff / 1000 / 60 / 60 / 24 / 30; break;
				case 'week': diff = diff / 1000 / 60 / 60 / 24 / 7; break;
				case 'day': diff = diff / 1000 / 60 / 60 / 24; break;
				case 'hour': diff = diff / 1000 / 60 / 60; break;
				case 'minute': diff = diff / 1000 / 60; break;
				case 'second': diff = diff / 1000; break;
				default: diff = diff;
			}

			if (precise) return round(diff, 1);
			return Math.floor(diff);
		},

		isWeekday: function() {
			return this.day() % 6 !== 0;
		},

		isWeekend: function() {
			return this.day() % 6 === 0;
		},

		isSame: function(d, unit) {
			d = _date(d);
			unit = normalizeUnits(unit);

			var units = ['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'];

			if ('week' == unit) return this.year() == d.year() && this.week() == d.week();

			var match;
			for (var i = 0; i < units.length; i++) {
				switch (units[i]) {
					case 'year': match = (this.year() == d.year()); break;
					case 'month': match = (this.month() == d.month()); break;
					case 'day': match = (this.date() == d.date()); break;
					case 'hour': match = (this.hour() == d.hour()); break;
					case 'minute': match = (this.minute() == d.minute()); break;
					case 'second': match = (this.second() == d.second()); break;
					case 'millisecond': match = (this.millisecond() == d.millisecond()); break;
				}

				if (!match) return false;
				if (units[i] == unit) return true;
			}

			return true;
		},

		between: function(start, end) {
			return this.unix() >= _date(start).unix() && this.unix() <= _date(end).unix();
		},

		from: function(date, verbose, postfix, prefix) {
			var val,
				str,
				seconds = _date(date).unix() - this.unix();

			if (seconds <= 45) return verbose ? 'just now' : 'now';

			if (seconds > 29808000) {val = Math.round(seconds / 31536000); str = verbose ? ' year' : 'y';}
			else if (seconds > 2160000) {val = Math.round(seconds / 2592000); str = verbose ? ' month' : 'mo';}
			else if (seconds > 79200) {val = Math.round(seconds / 86400); str = verbose ? ' day' : 'd';}
			else if (seconds > 2700) {val = Math.round(seconds / 3600); str = verbose ? ' hour' : 'h';}
			else if (seconds > 45) {val = Math.round(seconds / 60); str = verbose ? ' minute' : 'm';}
			else {val = seconds; str = verbose ? ' second' : 's';}

			str += (verbose && val != 1) ? 's' : '';

			var postfix_str = postfix ? ' ' + postfix : '';
			var prefix_str = prefix ? prefix + ' ' : '';

			return prefix_str + val + str + postfix_str;
		},

		fromNow: function(verbose, postfix, prefix) {
			return this.from(new Date(), verbose, postfix, prefix);
		},

		// Set the date for the specified day of the current month.
		// E.g. dayOfMonth(5, 'day') -> 5th day of the month
		// E.g. dayOfMonth(1, 3) -> 1st Wednesday of the month
		// E.g. dayOfMonth('last', 'day') -> last day of the month
		dayOfMonth: function(which, day) {
			var matching_days = [];
			var start = this.clone().startOf('month');
			while (start.isSame(this, 'month')) {
				if (Swing.isNumeric(day) && start.day() == day) {
					matching_days.push(start.date());
				}
				else if ('day' == day) {
					matching_days.push(start.date());
				}

				start.add(1, 'day');
			}

			var found_date = null;
			if (Swing.isNumeric(which)) {
				if ('undefined' !== typeof matching_days[which-1]) {
					found_date = matching_days[which-1];
				}
			}
			else if ('last' == which) {
				if (matching_days.length > 0) {
					found_date = matching_days[matching_days.length-1];
				}
			}

			if (found_date) {
				this.date(found_date);
			}
			else {
				this._d = new Date('invalid');
			}

			return this;
		},

		valueOf: function() {
			return this._d.getTime();
		},

		unix: function() {
			return Math.floor(this._d.getTime() / 1000);
		},

		toISOString : function() {
			return this._d.toISOString();
		},

		toString : function() {
			return this._d.toString();
		},

		toJSON : function() {
			return this.toISOString();
		},

		toDate : function() {
			return new Date(this.valueOf());
		},

		isDST: function() {
			var jan = new Date(this.year(), 0, 1);
			var jul = new Date(this.year(), 6, 1);
			var stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
			return this._d.getTimezoneOffset() < stdTimezoneOffset;
		},

		isValid: function() {
			return !isNaN(this._d.getTime());
		},

		clone: function() {
			return new _date(this.valueOf(), this.utc);
		},

		toUTC: function() {
			return this.timezone('UTC');
		},

		format: function(mask) {
			if (!this.isValid()) return 'Invalid date';

			mask = String(masks[mask] || mask || masks['default']);

			var	_ = this.utc ? 'getUTC' : 'get',
				d = this._d[_ + 'Date'](),
				D = this._d[_ + 'Day'](),
				m = this._d[_ + 'Month'](),
				y = this._d[_ + 'FullYear'](),
				H = this._d[_ + 'Hours'](),
				M = this._d[_ + 'Minutes'](),
				s = this._d[_ + 'Seconds'](),
				L = this._d[_ + 'Milliseconds'](),
				o = this.utc ? 0 : this._d.getTimezoneOffset(),
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
					Z:    this.utc ? 'UTC' : (String(this._d).match(timezone) || ['']).pop().replace(timezoneClip, ''),
					o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		}
	};

	Swing.date.utc = function(d, format) {
		return new _date(d, true, format);
	};

	Swing.date.isInstance = function(d) {
		return d instanceof _date;
	};

	Swing.date.isDate = function(d) {
		return d instanceof Date;
	};

	Swing.date.normalizeUnits = normalizeUnits;
})(window.Swing || (window.Swing = {}));

export default window.Swing.date;
