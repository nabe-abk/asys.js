//##############################################################################
// Ajax
//##############################################################################
////////////////////////////////////////////////////////////////////////////////
// send_ajax
////////////////////////////////////////////////////////////////////////////////
$$.send_ajax = function(opt) {
	const self=this;
	//--------------------------------------------------
	// Create Promise if not set callback functions.
	//--------------------------------------------------
	if (!opt.success && !opt.error_dialog_callback) {
		return new Promise( (resolve, reject) => {
			self.send_ajax({
				...opt,
				success: resolve,
				error_dialog_callback: reject
			});
		});
	}

	//--------------------------------------------------
	// main
	//--------------------------------------------------
	function ajax_error(err, h) {
		if (opt.error) if (!opt.error(err, h)) return;

		let msg = '';
		if (h) {
			if (h.msg) msg += '<p>' + self.tag_esc(h.msg.toString()) + '</p>';
			if (h.errs) {
				const ary = [];
				const e = h.errs;
				const o = e._order || Object.keys(e);
				for(let i in o) {
					if (e[o[i]]=='') continue;
					ary.push( self.tag_esc(e[o[i]]) );
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
		data:		data.toString() === '[object Object]' ? $.param(data) : data,
		processData:	false,
		contentType:	false,
		dataType:	'json',
		error:		ajax_error,
		success:	function(h) {
			if (h.ret != '0') return ajax_error('ret!=0', h);
			if (h._debug)     return ajax_error('_debug', h);
			if (opt.success) opt.success(h);
		},
		complete:	opt.complete,
	});
};
