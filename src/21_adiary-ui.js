//#############################################################################
// adiary UI
//							(C)2019 nabe@abk
//#############################################################################
///////////////////////////////////////////////////////////////////////////////
// dialog
///////////////////////////////////////////////////////////////////////////////
// The "modal" option ignore, this option exists on jQuery UI.
//
$.fn.adiaryDialog = function(opt) {
	if ( opt === 'open' )	return this.adiaryDialogOpen();
	if ( opt === 'close' )	return this.adiaryDialogClose();
	if (!$.adiary_ui_zindex)
		$.adiary_ui_zindex = 1000;

	const self = this;
	///////////////////////////////////////////////////////////////////////
	// init dialog div
	///////////////////////////////////////////////////////////////////////
	const $win = $(window);
	const $dialog = $('<div>').addClass('ui-dialog aui-dialog');
	const width = opt.width     || 300;
	const min_h = opt.minHeight || 150;
	const x = $win.scrollLeft() + ($win.width()  - width )/2;
	$dialog.css({
		width:		width,
		minHeight:	min_h,
		left:		x
	});
	if (opt.maxHeight) $dialog.css('max-height', opt.maxHeight);
	if (opt.dialogClass)
		$dialog.addClass( opt.dialogClass );

	const data = this.adiaryUIData('dialog');
	///////////////////////////////////////////////////////////////////////
	// header
	///////////////////////////////////////////////////////////////////////
	{
		const $title = $('<div>').addClass('ui-dialog-titlebar ui-widget-header');
		const $span  = $('<span>').addClass('ui-dialog-title')
			.html( opt.title || this.attr('title') || '&ensp;' );
		$title.append( $span );
		const $close = $('<button>').addClass('ui-button').attr({
			title: 'Close',
			tabindex: -1
		});
		$close.append( $('<span>').addClass('ui-icon ui-icon-closethick') );
		$title.append( $close );
		$dialog.append( $title );

		$close.on('click', function(){
			if (opt.exit) opt.exit();
			self.adiaryDialogClose();
		});
		data.$header = $title;
	}

	///////////////////////////////////////////////////////////////////////
	// ESC
	///////////////////////////////////////////////////////////////////////
	if (!('closeOnEscape ' in opt) || opt.closeOnEscape) {
		$dialog.on('keydown', function(evt){
			if (evt.which != 27) return;	// ESC

			if (opt.exit) opt.exit();
			self.adiaryDialogClose();
		});
	}

	///////////////////////////////////////////////////////////////////////
	// main
	///////////////////////////////////////////////////////////////////////
	this.addClass('ui-dialog-content');
	data.$restore = this.parent();
	$dialog.append( this );
	this.show();

	///////////////////////////////////////////////////////////////////////
	// button
	///////////////////////////////////////////////////////////////////////
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

	///////////////////////////////////////////////////////////////////////
	// disable tab indexes
	///////////////////////////////////////////////////////////////////////
	const tabs = [];
	data.tabs = tabs;
	$('a, input, button, select, textarea').each(function(idx,dom){
		const $obj = $(dom);
		tabs.push({
			$obj:	$obj,
			index:	$obj.attr('tabindex')
		})
		$obj.attr('tabindex', -1);
	});
	if (document.activeElement) $(document.activeElement).blur();

	///////////////////////////////////////////////////////////////////////
	// append dialog obj
	///////////////////////////////////////////////////////////////////////
	data.$overlay = $('<div>').addClass('ui-overlay aui-overlay');
	data.$dialog  = $dialog;
	data.open        = opt.open;
	data.beforeClose = opt.beforeClose;

	if (opt && !opt.autoOpen && 'autoOpen' in opt) return this;

	return this.adiaryDialogOpen();
};

$.fn.adiaryDialogOpen = function() {
	const data    = this.adiaryUIData('dialog');
	const $dialog = data.$dialog;
	if (!$dialog) throw("Do not open dialog!");

	this.adiaryUIAppend( data.$overlay );
	this.adiaryUIAppend( data.$dialog  );

	// set css
	const h  = this.height();
	const hf = data.$header.outerHeight() + (data.$footer ? data.$footer.outerHeight() : 0);
	this.css('height', 'calc(100% - ' + hf + 'px)');
	$dialog.css('height', $dialog.outerHeight());	// needs for calc 100%

	const $win  = $(window);
	const y = $win.scrollTop()  + ($win.height() - $dialog.outerHeight())/2;
	$dialog.css('top', y);
	$dialog.adiaryDraggable({
		handle: '.ui-dialog-titlebar'
	});

	if (data.open) data.open( null, this );

	return this;
};

$.fn.adiaryDialogClose = function() {
	const data = this.adiaryUIData('dialog');
	if (data.beforeClose) data.beforeClose.call( null, this );

	this.adiaryUIRemove( data.$overlay );
	this.adiaryUIRemove( data.$dialog  );
	if (data.$restore && data.$restore.length) data.$restore.append( this );

	// recovery tab index
	const tabs = data.tabs;
	for(let i in tabs) {
		let tab = tabs[i];
		let idx = tab.index;
		if (idx === undefined) tab.$obj.removeAttr('tabindex');
				else   tab.$obj.attr('tabindex', idx)
	}

	return this;
};

///////////////////////////////////////////////////////////////////////////////
// dialog sub functions
///////////////////////////////////////////////////////////////////////////////
$.fn.adiaryUIAppend = function($obj) {
	const data = this.adiaryUIData();
	$obj.css('z-index', $.adiary_ui_zindex++);
	$('body').append( $obj );
};

$.fn.adiaryUIRemove = function($obj) {
	$.adiary_ui_zindex--;
	$obj.remove();
};

///////////////////////////////////////////////////////////////////////////////
// Progressbar
///////////////////////////////////////////////////////////////////////////////
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
};

///////////////////////////////////////////////////////////////////////////////
// accordion
///////////////////////////////////////////////////////////////////////////////
$.fn.adiaryAccordion = function(opt) {
	const $objs = this.children("h1,h2,h3,h4,h5,h6");
	$objs.click(function(evt){
		const $obj = $(evt.target);
		const $div = $obj.next('div');
		if (!$div.length) return;
		$div.toggleDelay();
	});
	$objs.next('div').hide();
};

///////////////////////////////////////////////////////////////////////////////
// draggable
///////////////////////////////////////////////////////////////////////////////
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
		return;
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
};

///////////////////////////////////////////////////////////////////////////////
// data function
///////////////////////////////////////////////////////////////////////////////
$.fn.adiaryUIData = function(name, key, val) {
	name = 'aui_' + name;
	const data = this[name] = this[name] || {};
	if (arguments.length==2) return data[key];
	if (arguments.length==3) data[key] = val;
	return data;
};