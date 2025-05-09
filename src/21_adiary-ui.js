//##############################################################################
// adiary UI
//							(C)2019-2025 nabe@abk
//##############################################################################
////////////////////////////////////////////////////////////////////////////////
// dialog, use Popover API
////////////////////////////////////////////////////////////////////////////////
$.fn.adiaryDialog = function(opt = {}) {
	const self = this;
	if ( opt === 'open' )	return this.adiaryDialogOpen();
	if ( opt === 'close' )	return this.adiaryDialogClose();

	////////////////////////////////////////////////////////////////////////
	// init dialog
	////////////////////////////////////////////////////////////////////////
	const $win = $(window);
	const $dialog = $('<dialog>').addClass('ui-dialog').attr('tabindex', -1);
	const min_w = opt.minWidth  || 200;
	const min_h = opt.minHeight || 150;
	let   width = opt.width     || 300;
	if (width<0) width='auto';
	$dialog.css({
		width:		width,
		minWidth:	min_w,
		minHeight:	min_h
	});
	if (opt.maxWidth)    $dialog.css('max-width',  opt.maxWidth );
	if (opt.maxHeight)   $dialog.css('max-height', opt.maxHeight);
	if (opt.dialogClass) $dialog.addClass( opt.dialogClass );

	const data = this.adiaryUIData('dialog', { ...opt });
	// data.open        = opt.open;
	// data.close       = opt.close;
	// data.beforeClose = opt.beforeClose;
	// data.modal       = opt.modal;
	data.$dialog = $dialog;
	data.min_h   = min_h;

	////////////////////////////////////////////////////////////////////////
	// header
	////////////////////////////////////////////////////////////////////////
	const $title = $('<div>').addClass('ui-dialog-titlebar ui-widget-header');
	const $span  = $('<span>').addClass('ui-dialog-title')
		.html( opt.title || this.attr('title') || '&ensp;' );
	$title.append( $span );
	$dialog.append( $title );

	// close button
	if (opt.noExit) {
		$dialog.on('cancel', function(evt){ return false; });
	} else {
		const $close = $('<button>').addClass('ui-button').attr({
				title: 'Close',
				tabindex: -1
			});
		$close.append( $('<span>').addClass('ui-icon ui-icon-closethick') );
		$title.append( $close );
		$close.on('click', function(){
			if (opt.exit) opt.exit();
			self.adiaryDialogClose();
		});

		$dialog.on('keydown', function(evt){
			if (evt.key == 'Escape') $close.click();
		});
	}
	data.$header = $title;


	////////////////////////////////////////////////////////////////////////
	// main
	////////////////////////////////////////////////////////////////////////
	data.$restore = this.parent();
	data.display  = this.css('display');

	this.addClass('ui-dialog-content');
	$dialog.append( this );
	this.show();

	////////////////////////////////////////////////////////////////////////
	// button
	////////////////////////////////////////////////////////////////////////
	if (opt.buttons) {
		const $footer = $('<div>').addClass('ui-dialog-buttonpane');
		const $btnset = $('<div>').addClass('ui-dialog-buttonset');
		const btns = opt.buttons;
		const $btns = [];
		for(let i in btns) {
			let $btn = $('<button>')
					.addClass('ui-button')
					.attr('type', 'button')
					.text( i );
			$btn.on('click', btns[i]);
			$btnset.append($btn);
			$btns.push($btn);
		}
		$footer.append( $btnset );
		$dialog.append( $footer );
		data.$footer = $footer;
	}

	////////////////////////////////////////////////////////////////////////
	// end
	////////////////////////////////////////////////////////////////////////
	if (opt && !opt.autoOpen && 'autoOpen' in opt) return this;

	return this.adiaryDialogOpen();
}

$.fn.adiaryDialogOpen = function() {
	const data    = this.adiaryUIData('dialog');
	const $dialog = data.$dialog;
	if (!$dialog) throw("Do not open dialog!");

	if (data.modal) {
		$dialog.adiaryShowModal();
	} else {
		$('body').append($dialog);
		$dialog[0].show();
		$dialog.focus();
	}

	// set css
	const $win = $(window);
	const hf   = data.$header.outerHeight() + (data.$footer ? data.$footer.outerHeight() : 0);
	this.css('min-height', (data.min_h    - hf) + 'px');
	this.css('max-height', ($win.height() - hf) + 'px');

	const x = $win.scrollLeft() + ($win.width()  - $dialog.outerWidth() )/2;
	const y = $win.scrollTop()  + ($win.height() - $dialog.outerHeight())/2;
	$dialog.css({
		left:	x,
		top:	y
	});
	$dialog.adiaryDraggable({
		handle: '.ui-dialog-titlebar'
	});

	if (data.open) data.open( null, this );

	return this;
}

$.fn.adiaryDialogClose = function() {
	const data    = this.adiaryUIData('dialog');
	const $dialog = data.$dialog;
	if (!$dialog) throw("Do not close dialog!");

	if (data.beforeClose) data.beforeClose.call( null, this );

	if (data.modal) {
		$dialog.adiaryCloseModal();
	} else {
		$dialog[0].close();
		$dialog.detach();
	}
	data.$dialog =null;

	if (data.$restore && data.$restore.length) {
		this.css('display', data.display);
		data.$restore.append( this );
	}

	if (data.close) data.close.call( null, this );

	return this;
}

////////////////////////////////////////////////////////////////////////////////
// overlay and modal function
////////////////////////////////////////////////////////////////////////////////
$.adiaryShowOverlay = function() {
	const $overlay = $('<dialog>').addClass('ui-overlay').attr('tabindex', -1);
	$overlay.adiaryShowModal();
	$overlay.close = function(){
		this.adiaryCloseModal();
		return this;
	}
	return $overlay;
}

$.fn.adiaryShowModal = function() {
	const inert = this.adiaryUIData('modal-inert', []);
	$('body').children().each((idx,dom) => {
		if (dom.inert) return;
		inert.push(dom);
		dom.inert = true;
	});
	this.attr('popover', 'manual');
	$('body').append(this);
	this[0].showPopover();
	this.focus();

	return this;
}

$.fn.adiaryCloseModal = function() {
	const inert = this.adiaryUIData('modal-inert');
	for(const dom of inert) {
		dom.inert = false;
	}
	this[0].close();
	this.detach();
}

////////////////////////////////////////////////////////////////////////////////
// Progressbar
////////////////////////////////////////////////////////////////////////////////
$.fn.adiaryProgressbar = function(opt) {
	const data  = this.adiaryUIData('progress');
	if (opt === 'value') return data.value;

	if (opt.change)   data.change   = opt.change;
	if (opt.complete) data.complete = opt.complete;

	let init;
	if (!('$value' in data)) {
		this.find('.ui-progressbar-value').remove();
		// initalize
		data.$value = $('<div>').addClass('ui-progressbar-value');
		this.addClass('ui-progressbar');
		this.append( data.$value );
		init = true;
	}

	// value set
	const old   = data.value;
	const value = opt.value;
	data.value  = value;
	data.$value.css('width', value + '%');

	if (init || data.change && old != value) data.change  (data.value);
	if (      data.complete && 100 <= value) data.complete(data.value);
	return this;
}

////////////////////////////////////////////////////////////////////////////////
// accordion
////////////////////////////////////////////////////////////////////////////////
$.fn.adiaryAccordion = function(opt) {
	const $objs = this.children("h1,h2,h3,h4,h5,h6");
	$objs.click(function(evt){
		const $obj = $(evt.target);
		const $div = $obj.next('div');
		if (!$div.length) return;
		$div.toggleDelay();
	});
	$objs.next('div').hide();
}

////////////////////////////////////////////////////////////////////////////////
// draggable
////////////////////////////////////////////////////////////////////////////////
$.fn.adiaryDraggable = function(opt) {
	let sx;
	let sy;
	let $obj;
	this.addClass('aui-draggable');

	this.on('mousedown', function(evt){
		$('iframe').css('pointer-events', 'none');
		const $tar = $(evt.target);
		$obj = $tar.hasClass('aui-draggable') ? $tar : $tar.parentsOne('.aui-draggable');

		if (opt) {
			const $o = $tar;
			if ($tar != $obj) $o.add($tar.parentsUntil('.aui-draggable'));
			if (opt.cancel &&  $o.filter(opt.cancel).length) return;
			if (opt.handle && !$o.filter(opt.handle).length) return;
		}
		const p = $obj.offset();
		sx = p.left - evt.pageX;
		sy = p.top  - evt.pageY;
		document.addEventListener('mousemove', move);
		evt.preventDefault();
	});

	this.on('mouseup', function(evt){
		$('iframe').css('pointer-events', 'auto');
		document.removeEventListener('mousemove', move);
		evt.preventDefault();
	});

	function move(evt) {
		const x = sx + evt.pageX;
		const y = sy + evt.pageY;
		$obj.css({
			position:	'absolute',
			left:		x + 'px',
			top:		y + 'px'
		});
		evt.preventDefault();
	}
}

////////////////////////////////////////////////////////////////////////////////
// data function
////////////////////////////////////////////////////////////////////////////////
$.fn.adiaryUIData = function(name, val) {
	name = 'aui_' + name;
	if (arguments.length==2) this[name] = val;
	const data = this[name] ||= {};
	return data;
}

