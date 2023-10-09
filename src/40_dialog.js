//##############################################################################
// dialog functions
//##############################################################################
$$.dialog = function($div, opt) {
	let btn = {};
	btn[ opt.btn_ok || this.msg('ok') ] = function(){
		$div.adiaryDialog('close');
		if (opt.callback) opt.callback(true);
	};
	if (!opt.noClose) {
		btn[ opt.btn_cancel || this.msg('cancel') ] = function(){
			$div.adiaryDialog('close');
			if (opt.callback) opt.callback(false);
		};
	}

	$div.adiaryDialog({
		title: opt.title,
		modal: true,
		noClose: opt.noClose,
		dialogClass: opt.class,
		buttons: btn,
		open: function(){
			const $bp = $div.siblings('.ui-dialog-buttonpane');
			if (opt.focus === 'ok')     $bp.find('button:eq(0)').focus();
			if (opt.focus === 'cancel') $bp.find('button:eq(1)').focus();
		},
		exit: function(){
			if (opt.callback) opt.callback(false);
		}
	});
}

////////////////////////////////////////////////////////////////////////////////
// base dialog
////////////////////////////////////////////////////////////////////////////////
$$.dialog_base = function(opt, msg, marg, callback) {
	if (!callback && typeof(marg) === 'function') {
		callback = marg; marg = null;
	}
	const $obj = msg instanceof $ ? msg : (msg.substr(0,1) == '#' && $secure(msg));

	let $div;
	if (marg && !$obj) {
		$div = $('<div>');
		if (marg) {
			msg = msg.replace(/%([A-Za-z])/g, function(w,m1){ return marg[m1] });
			msg = msg.replace(/%[A-Za-z]/g, '');
		}
		$div.html( msg );
	} else {
		$div = $obj;
	}
	opt.title ||= $obj && $obj.data('title') || this.msg('confirm');

	if (callback) opt.callback=callback;

	$$.dialog($div, opt);
}

////////////////////////////////////////////////////////////////////////////////
// dialogs
////////////////////////////////////////////////////////////////////////////////
$$.show_dialog = function(msg, marg, callback) {
	return this.dialog_base({
		noClose: true
	}, msg, marg, callback);
}

$$.confirm = function(msg, marg, callback) {
	return this.dialog_base({
		title:	this.msg('confirm')
	}, msg, marg, callback);
}

$$.show_error = function(msg, marg, callback) {
	return this.dialog_base({
		noClose: true,
		class:	'error-dialog',
		title:	this.msg('error')
	}, msg, marg, callback);
}

////////////////////////////////////////////////////////////////////////////////
// form dialog
////////////////////////////////////////////////////////////////////////////////
$$.form_dialog = function(title, ele, callback) {
	let $form;

	if (ele instanceof $) {
		$form = ele;

	} else {
		$form = $('<form>');
		if (!Array.isArray(ele)) ele = [ ele ];

		for(const x of ele) {
			if (typeof(x) === 'string') {
				$form.append( $('<div>').html(x) );
				continue;
			}
			if (x.type == 'p') {
				$form.append( $('<p>').html( x.html ) );
				continue;
			}
			if (x.type == 'textarea') {
				const $ta = $('<textarea>').attr({
					rows: x.rows || 5,
					name: x.name
				}).addClass('w100p');
				if (x.val != '') $ta.text( x.val );
				$form.append( $ta );
				continue;
			}
			if (x.type == '*') {
				$form.append( x.html );
				continue;
			}
			// else
			const $item = $('<div>');
			if ('before' in x) $item.append(x.before);

			$item.append($('<input>').attr({
					type: x.type || 'text',
					name: x.name,
					value: x.value
				}).addClass( x.class || 'w80p')
			);
			if (x.iclass) $item.addClass(x.iclass);

			if ('after' in x) $item.append(x.after);
			$form.append( $item );
		}
	}
	const cbfunc = function(flag) {
		if (flag) return callback($form.parseFormHash());
	};

	// stop submit by enter
	$form.on('keypress', 'input', function(evt) {
		if (evt.which !== 13) return true;
		$form.adiaryDialogClose();
		cbfunc(true);
		return false;
	});

	this.dialog($form, {
		title:	title,
		callback: cbfunc
	});
}
