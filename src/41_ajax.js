//##############################################################################
// Ajax
//##############################################################################
////////////////////////////////////////////////////////////////////////////////
// send_ajax
////////////////////////////////////////////////////////////////////////////////
$$.send_ajax = function(opt) {
	const self=this;

	function ajax_error(err, h) {
		if (opt.error) if (!opt.error(err, h)) return;
		if ('dialog' in opt && !opt.dialog) return;

		let msg = '';
		if (h) {
			if (h.ret && h._develop) msg += 'ret = ' + h.ret;
			if (h.msg)    msg += '<p>' + self.tag_esc(h.msg.toString())    + '</p>';
			if (h.errs) {
				const ary = [];
				const e = h.errs;
				const o = e._order || Object.keys(e);
				for(let i in o) {
					if (e[o[i]]=='') continue;
					ary.push(e[o[i]]);
				}
				msg += '<p class="ni">' + ary.join("<br>") + '</p>';
			}
			if (h._debug) msg += '<p class="ni">' + h._debug.replace(/\n/g, '<br>') + '</p>';
		} else {
			msg = '<p>' + self.msg('server_response_error', 'response data error!') + '</p>';
		}
		self.show_error(msg, function(){
			if (opt.error_dialog_callback) opt.error_dialog_callback(err, h)
		});
	}
	const data = opt.data;
	return $.ajax(opt.url || self.myself || './', {
		method:		'POST',
		data:		data.toString() == '[object Object]' ? $.param(data) : data,
		processData:	false,
		contentType:	false,
		dataType:	'json',
		error:		function(e) { ajax_error(e); },
		success:	function(h) {
			if (h.ret != '0' || h._debug) return ajax_error('', h);
			if (opt.success) opt.success(h);
		},
		complete:	opt.complete,
	});
};

////////////////////////////////////////////////////////////////////////////////
//●promise of ajax
////////////////////////////////////////////////////////////////////////////////
$$.send_ajax_promise = function(opt) {
	const self=this;

	return new Promise( function(resolve, reject) {
		opt.error_dialog_callback = function(e){
			reject(e);
		};
		if ('dialog' in opt && !opt.dialog) opt.error = opt.error_dialog_callback;

		opt.success = function(h) {
			resolve(h);
		};
		self.send_ajax(opt);
	});
}
