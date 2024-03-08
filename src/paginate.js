import './core';
import './events';

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
	
	var pagintate = Swing.paginate = function(parent, options) {
		options || (options = {});
		
		this.parent   = parent;
		this.options  = options;
		this.el       = null;
		this.page     = null;
		this.pages    = null;
		this.type     = options.type || 'paginated';
		this.disabled = false;
		
		this.build();
		this.setPage(1);
		
		this.click_callback       = options.click || null;
		this.change_callback      = options.change || null;
		this.pageschange_callback = options.pages_change || null;
	};
	
	pagintate.prototype = {
		show: function() {
			if (null !== this.pages && this.pages <= 1) {
				return;
			}
			
			this.el.style.display = '';
		},
		
		hide: function() {
			this.el.style.display = 'none';
		},
		
		enable: function() {
			Swing.each(this.el.querySelectorAll('.disabled'), function(el) {
				removeClass(el, 'disabled');
			});
			Swing.each(this.el.querySelectorAll('.was-disabled'), function(el) {
				addClass(el, 'disabled');
				removeClass(el, 'was-disabled');
			});
			removeClass(this.el, 'pagination-loading');
			
			this.disabled = false;
		},
		
		disable: function() {
			Swing.each(this.el.querySelectorAll('.was-disabled'), function(el) {
				removeClass(el, 'was-disabled');
			});
			Swing.each(this.el.querySelectorAll('.disabled'), function(el) {
				addClass(el, 'was-disabled');
			});
			Swing.each(this.el.querySelectorAll('li'), function(el) {
				addClass(el, 'disabled');
			});
			Swing.each(this.el.querySelectorAll('button'), function(el) {
				addClass(el, 'disabled');
			});
			
			this.disabled = true;
		},
		
		loading: function() {
			this.disable();
			addClass(this.el, 'pagination-loading');
		},
		
		click: function(callback) {
			this.click_callback = callback;
		},
		
		change: function(callback) {
			this.change_callback = callback;
		},
		
		pagesChange: function(callback) {
			this.pageschange_callback = callback;
		},
		
		setNumPages: function(pages) {
			if (null !== this.pages && pages == this.pages) {
				return;
			}
			
			this.pages = pages;
			
			var change_callback = this.change_callback;
			this.change_callback = null;
			
			this.setPage(this.page);
			
			this.change_callback = change_callback;
			
			if (this.pages <= 1) {
				this.hide();
			}
			
			if (this.pageschange_callback) {
				this.pageschange_callback(this, pages);
			}
		},
		
		setPage: function(page) {
			page = Number(page);
			if (page < 1) {
				return;
			}
			
			if (null !== this.pages && page > this.pages) {
				return;
			}
			
			if ('paginated' == this.type) {
				this._setPaginated(page);
			}
			else if ('more' == this.type) {
				this._setMore(page);
			}
			
			this.page = page;
			
			if (this.change_callback) {
				this.change_callback(this, page);
			}
		},
		
		_setPaginated: function(page) {
			var threshold = this.options.threshold || 3;
			var start     = page - threshold;
			var end       = page + threshold;
			
			if (start < 1) {
				start = 1;
			}
			
			if (null === this.pages) {
				end = page;
			}
			else if (end > this.pages) {
				end = this.pages;
			}
			
			if (end - start < threshold * 2) {
				var diff = (threshold * 2) - (end - start);
				
				if (start > 1) {
					start -= diff;
				}
				else {
					end += diff;
				}
			}
			
			if (start < 1) {
				start = 1;
			}
			
			if (null === this.pages) {
				end = page;
			}
			else if (end > this.pages) {
				end = this.pages;
			}
			
			if (start > 1) {
				start += 2;
			}
			if (null !== this.pages) {
				if (end < this.pages) {
					end -= 2;
				}
			}
			
			Swing.each(this.el.querySelectorAll('.separator'), function(el) {
				if (el.parentNode) el.parentNode.removeChild(el);
			});
			Swing.each(this.el.querySelectorAll('.page'), function(el) {
				if (el.parentNode) el.parentNode.removeChild(el);
			});
			
			if (start > 1) {
				var li_1 = document.createElement('li');
				addClass(li_1, 'page-item page page-1');
				li_1.setAttribute('data-page', 1);
				li_1.innerHTML = '<a href="#" class="page-link">1</a>';
				var pg_prev = this.el.querySelector('.pg-prev');
				pg_prev.parentNode.insertBefore(li_1, pg_prev.nextSibling);
				
				if (start > 2) {
					var li_separator_prev = document.createElement('li');
					addClass(li_separator_prev, 'separator separator-prev disabled');
					li_separator_prev.innerHTML = '<span>...</span>';
					li_1.parentNode.insertBefore(li_separator_prev, li_1.nextSibling);
				}
			}
			
			for (var i = start; i <= end; i++) {
				var last = this.el.querySelector('.pg-prev');
				var pages = this.el.querySelectorAll('.page');
				if (pages.length) {
					last = pages[pages.length-1];
				}
				if (this.el.querySelector('.separator-prev') && pages.length <= 1) {
					last = this.el.querySelector('.separator-prev');
				}
				
				var li_cur = document.createElement('li');
				addClass(li_cur, 'page-item page page-'+i);
				li_cur.setAttribute('data-page', i);
				li_cur.innerHTML = '<a href="#" class="page-link">'+i+'</a>';
				last.parentNode.insertBefore(li_cur, last.nextSibling);
			}
			
			if (null !== this.pages && end < this.pages) {
				var pg_next = this.el.querySelector('.pg-next');
				
				if ((end + 1) < this.pages) {
					var li_separator_next = document.createElement('li');
					addClass(li_separator_next, 'separator separator-next disabled');
					li_separator_next.innerHTML = '<span>...</span>';
					pg_next.parentNode.insertBefore(li_separator_next, pg_next);
				}
				
				var li_last = document.createElement('li');
				addClass(li_last, 'page-item page page-'+this.pages);
				li_last.setAttribute('data-page', this.pages);
				li_last.innerHTML = '<a href="#" class="page-link">'+this.pages+'</a>';
				pg_next.parentNode.insertBefore(li_last, pg_next);
			}
			
			Swing.each(this.el.querySelectorAll('.disabled'), function(el) {
				removeClass(el, 'disabled');
			});
			
			if (page == 1) {
				Swing.each(this.el.querySelectorAll('.pg-prev'), function(el) {
					addClass(el, 'disabled');
				});
			}
			else if (null !== this.pages && page == this.pages) {
				Swing.each(this.el.querySelectorAll('.pg-next'), function(el) {
					addClass(el, 'disabled');
				});
			}
			
			Swing.each(this.el.querySelectorAll('.active'), function(el) {
				removeClass(el, 'active');
			});
			Swing.each(this.el.querySelectorAll('.page-'+page), function(el) {
				addClass(el, 'active');
			});
		},
		
		_setMore: function(page) {
			Swing.each(this.el.querySelectorAll('button'), function(el) {
				el.innerHTML = this.options.more_text || 'Show More';
			}, this);
			
			if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
			
			if (page < this.pages) {
				if (this.options.more_top) {
					this.parent.insertBefore(this.el, this.parent.firstChild);
				}
				else {
					this.parent.appendChild(this.el);
				}
			}
		},
		
		build: function() {
			if ('paginated' == this.type) {
				this._buildPaginated();
			}
			else if ('more' == this.type) {
				this._buildMore();
			}
		},
		
		_buildPaginated: function() {
			this.el = document.createElement('ul');
			addClass(this.el, 'pagination pagination-paginated');
			this.el.style.display = 'none';
			
			if ('undefined' !== typeof this.options.id) {
				this.el.setAttribute('id', this.options.id);
			}
			
			this.el.innerHTML = '<li class="page-item pg-prev"><a href="#" class="page-link">&laquo;</a></li><li class="page-item pg-next"><a href="#" class="page-link">&raquo;</a></li>';
			
			Swing.on(this.el, 'click', function(e) {
				if (!e.target || 'A' != e.target.tagName) {
					return;
				}
				
				e.preventDefault();
				
				if (this.disabled) {
					return;
				}
				
				if (!this.click_callback) {
					return;
				}
				
				var page = null;
				var li = e.target.parentNode;
				
				if (li.getAttribute('data-page')) {
					page = li.getAttribute('data-page');
				}
				else if (hasClass(li, 'pg-prev')) {
					if (this.page && this.page > 1) {
						page = this.page - 1;
					}
				}
				else if (hasClass(li, 'pg-next')) {
					if (this.page) {
						if (null === this.pages || this.page < this.pages) {
							page = this.page + 1;
						}
					}
				}
				
				if (!page) {
					return;
				}
				
				if (this.page == page) {
					return;
				}
				
				this.click_callback(this, page);
			}, this);
			
			this.parent.appendChild(this.el);
		},
		
		_buildMore: function() {
			if ('UL' == this.parent.tagName) {
				this.el = document.createElement('li');
			}
			else if ('TABLE' == this.parent.tagName || 'TBODY' == this.parent.tagName) {
				this.el = document.createElement('tr');
			}
			else {
				this.el = document.createElement('div');
			}
			
			addClass(this.el, 'pagination-wrapper pagination-more');
			this.el.style.display = 'none';
			
			var btn_class = this.options.btn_class || 'btn btn-default btn-lg btn-block';
			
			var btn_el = document.createElement('button');
			addClass(btn_el, btn_class);
			btn_el.innerHTML = this.options.more_text || 'Show More';
			this.el.appendChild(btn_el);
			
			Swing.on(this.parent, 'click', function(e) {
				if (!e.target || 'BUTTON' != e.target.tagName || !hasClass(e.target, 'btn')) {
					return;
				}
				
				e.preventDefault();
				
				if (!this.page) {
					return;
				}
				
				e.target.innerHTML = this.options.loading_text || 'Loading...';
				
				this.click_callback(this, this.page + 1);
			}, this);
			
			if (this.options.more_top) {
				this.parent.insertBefore(this.el, this.parent.firstChild);
			}
			else {
				this.parent.appendChild(this.el);
			}
		}
	};
})(window.Swing || (window.Swing = {}));

export default window.Swing.paginate;
