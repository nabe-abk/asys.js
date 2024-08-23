//##############################################################################
// dialog functions
//##############################################################################
$$.dialog = function($div, _opt) {
	const opt = Object.assign({
		modal:	true
	}, _opt);

	// create Promise if not set opt.callback
	if (!opt.callback) {
		const self=this;
		return new Promise( (resolve, reject) => {
			const opt2 = opt ? { ...opt } : {};
			opt2.callback = (flag) => resolve(flag);
			self.dialog($div, opt2);
		});
	}

	const ok = opt.ok || this.msg('ok');
	const btn= {};
	btn[ok] = function(){
		$div.adiaryDialog('close');
		if (opt.callback) opt.callback( $div.prop('tagName')==='FORM' ? $div.parseFormHash() : true );
	};
	if (opt.cancelBtn) {
		btn[ opt.cancel || this.msg('cancel') ] = function(){
			$div.adiaryDialog('close');
			if (opt.callback) opt.callback(false);
		};
	}

	// stop submit by enter and push ok button
	$div.on('keypress', 'input', function(evt) {
		if (evt.which !== 13) return true;
		btn[ok]();
		return false;
	});

	$div.adiaryDialog({
		title: opt.title,
		modal: opt.modal,
		noExit: opt.noExit,
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

	let $div;
	if (msg instanceof $) {
		$div = msg;

	} else {
		if (msg instanceof Object) {
			opt = {...opt, ...msg};
			msg = msg.html;
		}

		if (msg && msg.substr(0,1)==='#') {
			$div = $secure(msg);

		} else {
			$div = $('<div>');
			if (marg) {
				msg = msg.replace(/%([A-Za-z])/g, function(w,m1){ return marg[m1] });
				msg = msg.replace(/%[A-Za-z]/g, '');
			}
			$div.html( msg );
		}
	}
	opt.title ||= $div && $div.data('title') || this.msg('confirm');

	if (callback) opt.callback=callback;

	return this.dialog($div, opt);
}

////////////////////////////////////////////////////////////////////////////////
// dialogs
////////////////////////////////////////////////////////////////////////////////
$$.show_dialog = function(msg, marg, callback, opt) {
	return this.dialog_base(
		Object.assign({
			noExit: true
		}, opt),
		msg, marg, callback);
}

$$.show_error = function(msg, marg, callback, opt) {
	return this.dialog_base(
		Object.assign({
			noExit: true,
			class:	'error-dialog',
			title:	this.msg('error')
		}, opt),
		msg, marg, callback);
}

$$.confirm = function(msg, marg, callback, opt) {
		return this.dialog_base(
		Object.assign({
			cancelBtn:	true,
			title:		this.msg('confirm')
		}, opt),
		msg, marg, callback);
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

	return this.dialog($form, {
		title: title,
		callback: callback
	});
}
