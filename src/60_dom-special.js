//##############################################################################
// dom special extentions
//##############################################################################
(function(){
	const ary = [];
	let   initialized;

	$$.dom_init = function(func, priority) {
		if (typeof(func) == 'function') {
			if (initialized) {
				if (priority) console.warn('dom_init() initialized, but priority set', priority);
				func.call(this, this.$body);
			}
			return ary.push({
				func:	func,
				p:	priority || 100
			});
		}

		// initlize functions
		ary.sort(function(a,b) {
			return a.p - b.p;
		});

		const $obj = func ? func : this.$body;
		for(var i=0; i<ary.length; i++)
			ary[i].func.call(this, $obj);

		initialized = true;
	};

	$$.init($$.dom_init);
})();

////////////////////////////////////////////////////////////////////////////////
// submit checker
////////////////////////////////////////////////////////////////////////////////
$$.dom_init( function($R){
	const self=this;

	$R.findx('button.js-check-form').on('click', function(evt){
		const $obj  = $(evt.target);
		const $form = $obj.parents('form.js-check-form');
		if (!$form.length) return;
		$form.data('confirm', $obj.data('confirm') );
		$form.data('focus',   $obj.data('focus')   );
		$form.data('button',  $obj);
	});

	$R.findx('form.js-check-form').onSequence('submit', 10, function(evt){
		const $form  = $(evt.target);
		const target = $form.data('target');
		let count=0;
		if (target) {
			count = $form.rootfind( target + ":checked" ).length;
			if (!count) return false;	// no check
		}

		// confirm message
		let confirm = $form.data('confirm');
		if (!confirm) return true;
  		if ($form.data('--js-check-form-ok')) {
  			$form.data('--js-check-form-ok', false);
  			return true;
  		}

		// confirm dialog
		self.dialog_base({
			title:		self.msg('confirm'),
			focus:		$form.data('focus'),
			cancelBtn:	true
		}, confirm, { c: count }
		, function(flag) {
			if (!flag) return;
  			$form.data('--js-check-form-ok', true);
			if ($form.data('button')) return $form.data('button').click();

			$form.triggerWithOE(evt.originalEvent);
		});
		return false;
	});
});

////////////////////////////////////////////////////////////////////////////////
// ajax form
////////////////////////////////////////////////////////////////////////////////
$$.dom_init( function($R) {
	const self=this;
	const submit_func = function(evt, $form){
		$form.find('.error').removeClass('error');

		// form data
		const gen  = $form.data('generator');
		let   data = gen ? gen($form, evt) : new FormData($form[0]);

		// submitter button
		const sb = evt.originalEvent && evt.originalEvent.submitter;
		if (sb && sb.tagName==='BUTTON' && sb.name!=='')
			data.append(sb.name, sb.value);

		// submit url-encode
		if (!gen && !$form.find('input[type="file"]').length)
			data = new URLSearchParams(data);

		// stop re-entry
		if (!$form.data('reentry')) {
			if ($form.data('--js-ajax-stop')) return;
			$form.data('--js-ajax-stop', true);
			$form.prop('disabled', true);
		}

		const $overlay   = $form.data('overlay') && $.adiaryShowOverlay();
		const start_func = $form.data('start');
		const comp_func  = $form.data('complete');
		if (typeof(start_func) === 'function') start_func($form);

		self.send_ajax({
			url:	$form.attr('action'),
			data:	data,
			success: function(h) {
				if ($overlay) $overlay.close();
				const success = $form.data('success');
				const url = $form.data('url');
				if (typeof(success) === 'function') return success(h);
				if (typeof(success) === 'string' && success != '') {
					return self.show_dialog(success, function(){
						if (url) location = url;
					});
				}
				if (url) location = url;
			},
			error: function(err, h) {
				if ($overlay) $overlay.close();
				const error = $form.data('error');
				if (typeof(error) === 'function') return error(h);

				if (!h || !h.errs) return true;
				const e = h.errs;
				for(let k in e) {
					if (k == '_order') continue;

					// with number?
					const ma  = k.match(/^(.*)#(\d+)$/);
					const num = ma ? ma[2] : undefined;
					k = ma ? ma[1] : k;
					try {
						let $x = $form.find('[name="' + k+ '"], [data-name="' + k + '"]');
						if (num) $x = $($x[num-1]);
						$x.addClass('error');
					} catch(e) {
						console.error(e);
					}
				}
				return true;
			},
			error_dialog_callback: function(){
				const callback = $form.data('error_dialog_callback');
				if (typeof(callback) === 'function') return callback();
			},
			complete: function(h) {
				if (typeof(comp_func) === 'function') comp_func($form);
				if ($form.data('--js-ajax-stop')) {
					$form.data('--js-ajax-stop', false);
					$form.prop('disabled', false);
				}
			}
		});
	};

	$R.find('form.js-ajax').onSequence('submit', 100, function(evt) {
		const $form  = $(evt.target);
		const submit = function(){ submit_func(evt, $form) };

		const checker = $form.data('checker');
		if (typeof(checker) === 'function') {
			if (! checker($form, submit)) return false;
		}
		submit();
		return false;
	});
});

////////////////////////////////////////////////////////////////////////////////
// auto save form value
////////////////////////////////////////////////////////////////////////////////
$$.dom_init( function($R) {
	const self = this;

	$R.findx('input.js-save, select.js-save').each( function(idx, dom) {
		const $obj = $(dom);
		const type = $obj[0].type;

		let id = type != 'radio' && $obj.attr("id");
		if (!id) id = 'name=' + $obj.attr("name");
		if (!id) return;

		if (type == 'checkbox') {
			$obj.change( function(evt){
				const $o = $(evt.target);
				self.Storage.set(id, $o.prop('checked') ? 1 : 0);
			});
			if ( self.Storage.defined(id) )
				$obj.prop('checked', self.Storage.get(id) != 0 );
			return;
		}
		if (type == 'radio') {
			const val = $obj.attr('value');
			$obj.change( function(evt){
				const $o = $(evt.target);
				self.Storage.set(id, val);
			});
			if ( self.Storage.defined(id) && val == self.Storage.get(id)) {
				$obj.prop('checked', 1);
			}
			return;
		}
		$obj.change( function(evt){
			const $o = $(evt.target);
			if ($o.val() == self.js_combo_dummy_val) return;
			self.Storage.set(id, $o.val());
		});
		const val = self.Storage.get(id);
		if (! val) return;
		if (dom.tagName == 'SELECT')
			return self.set_value_on_select( $obj, val );
		
		return $obj.val( val );
	});
});

////////////////////////////////////////////////////////////////////////////////
// form dom element enable/disable by other form elements
////////////////////////////////////////////////////////////////////////////////
$$.dom_init( function($R){
	const $objs = $R.findx('input.js-enable, input.js-disable, select.js-enable, select.js-disable');

	let   init;
	const func = function(evt) {
		const $btn = $(evt.target);
		const $tar = $btn.rootfind( $btn.data('target') );

		const type = $btn[0].type;

		// radio button with data-state="0" or "1"
		if (type == 'radio') {
			if ($btn.prop("disabled") || !$btn.prop("checked")) return;
			let flag = $btn.data("state");
			if ($btn.hasClass('js-enable')) flag=!flag;
			$tar.prop('disabled', flag);
			return;
		}

		let flag;
		if (type == 'checkbox') {
			flag = !$btn.prop("disabled") && $btn.prop("checked");
		} else if (type == 'number' || $btn.data('type') == 'int') {
			var val = $btn.val();
			flag = val.length && val > 0;
		} else {
			flag = ! ($btn.val() + '').match(/^\s*$/);
		}

		// change flag?
		if (!init && $btn.data('_flag') === flag) return;
		$btn.data('_flag', flag);

		// disabled?
		const counter = $btn.hasClass('js-disable') ? '_disable_c' :  '_enable_c';
		const add     = flag ? 1 : (init ? 0 : -1);
		$tar.each(function(idx,dom){
			const $obj = $(dom);
			$obj.data(counter, ($obj.data(counter) || 0) + add);

			const diff = ($obj.data('_disable_c') || 0) - ($obj.data('_enable_c') || 0)
				   + ($btn.hasClass('js-enable') ? 0.1 : 0);

			$obj.prop('disabled', diff>0);
		});
	}
	// regist
	$objs.change( func );
	init = true;
	$objs.change();
	init = false;
});

////////////////////////////////////////////////////////////////////////////////
// click for dom show/hide
////////////////////////////////////////////////////////////////////////////////
/* example)
	<label><input type="checkbox" class="js-switch" data-target="xxx"></label>
	<button type="button" class="js-switch"  data-target="xxx"
	 data-delay="300"
	 data-hide-val="show it" data-show-val="hide it" data-negative="1">msg</button>
*/
(function(){
	function toggle($obj, init) {
		if ($obj[0].tagName == 'A') return true;	// link click

		// append switch icon
		if (init && $obj[0].tagName != 'INPUT' && $obj[0].tagName != 'BUTTON') {
			const $span = $('<span>');
			$span.addClass('ui-icon switch-icon');
			$obj.prepend($span).addClass('sw-show');
		}

		const type = $obj[0].tagName == 'INPUT' && $obj[0].type;
		let   tar  = $obj.data('target');
		if (!tar) {
			// $obj is children
			$obj = $obj.parentsOne(".js-switch");
			if (!$obj.length) return;
			tar = $obj.data('target');
		}
		const $target = $(tar);
		if (!$target.length) return false;

		// save switch status
		const storage = $obj.existsData('save') ? this.Storage : null;

		// get current state
		const id = $obj.attr('id') || $obj.attr('name') || tar;
		let flag;
		if (init && storage && storage.defined(id)) {
			flag = storage.getInt(id) ? true : false;
			if (type == 'checkbox' || type == 'radio') $obj.prop("checked", flag);
		} else if (type == 'checkbox' || type == 'radio') {
			flag = $obj.prop("checked");
		} else if (init && $obj.data('default') == 'show') {
			flag = true;
		} else if (init && $obj.data('default') == 'hide') {
			flag = false;
		} else {
			flag = init ? !$target.is(':hidden') : $target.is(':hidden');
		}
		if ($obj.data('negative')) flag = !flag;

		// show speed
		let delay = $obj.data('delay');
		if (delay === undefined || delay === '') delay = this.DefaultShowSpeed;

		// fast mode
		if ($obj.data('fast')) {
			const css_id = '--css--' + id.replace(/[^\w\-]/g, '-');
			let   $css   = $('#' + css_id);
			if (!$css.length) {
				$css = $('<style>').attr('id', css_id);
				$('head').append($css);
			}
			$css.text( flag ? '' : tar + '{ display: none; }' );
			return true;
		}

		// set state
		if (flag) {
			$obj.addClass('sw-show');
			$obj.removeClass('sw-hide');
			if (init) $target.show();
			     else $target.show(delay);
			if (storage) storage.set(id, '1');
		
		} else {
			$obj.addClass('sw-hide');
			$obj.removeClass('sw-show');
			if (init) $target.hide();
			     else $target.hide(delay);
			if (storage) storage.set(id, '0');
		}
		if (type == 'button') {
			const val = flag ? $obj.data('show-val') : $obj.data('hide-val');
			if (val != undefined) $obj.val( val );
		}
		return true;
	}

	$$.dom_init( function($R){
		const self = this;
		const func = function(evt){
			const $obj = $(evt.target);
			if ($obj[0].type != "radio")
				return toggle.call(self, $obj);

			const name = $obj.attr('name');
			$('input.js-switch[name=\"' + name + '"]').each(function(idx, dom){
				 toggle.call(self, $(dom));
			});
		}

		$R.findx('.js-switch').each( function(idx,dom) {
			const $obj = $(dom);
			const f    = toggle.call(self, $obj, true);	// init=true
			if (f) 	// initalize success
				$obj.on(dom.tagName == 'INPUT' ? 'change' : 'click', func);
		} );
	});
})();

////////////////////////////////////////////////////////////////////////////////
// accordion
////////////////////////////////////////////////////////////////////////////////
$$.dom_init(function($R){
	const $accordion = $R.findx('.js-accordion');
	if (!$accordion.length) return;
	$accordion.adiaryAccordion();
});

////////////////////////////////////////////////////////////////////////////////
// custom multiple select
////////////////////////////////////////////////////////////////////////////////
$$.dom_init( function($R){
	$R.findx('select.js-multiple').each(function(idx,dom){
		const $sel = $(dom);
		if ($sel.prop('multiple')) return;	// if select is multiple, do nothing.
		// multiple select box is height box style.
		// $sel copy to after with multiple attribute.

		const $multi = $sel.clone(true).prop('multiple', true).removeClass('js-multiple').css('display', 'none');
		$sel.data('__multi', $multi);

		$sel.removeAttr('id');
		$sel.removeAttr('name');
		$multi.find('option.js-multiple-ignore').remove();
		$multi.insertAfter($sel);

		const $opts = $multi.find('option');
		$opts.each(function(idx,dom){
			const $opt = $(dom);
			$opt.prop('selected', $opt.data('selected'));
		});

		const __change = function(evt){
			const ary = [];
			$opts.each(function(idx,dom){
				const $opt = $(dom);
				if ($opt.prop('selected')) ary.push($opt.html());
			});
			if (ary.length) {
				const $add = $('<option>').addClass('js-multple-selected').html( ary[0] + (ary[1] ? '...' : '') );
				$sel.find('.js-multple-selected').remove();
				$sel.append( $add.prop('selected', true) );
			}
		};
		__change();
		$multi.on('change', __change);
	});
});

$$.init( function() {
	this.$body.on('mousedown keydown', 'select.js-multiple', function(evt){
		const $_obj  = $(evt.currentTarget);
		const $multi = $_obj.data('__multi') || $_obj;

		const lclass  = $multi.data('label-class');
		const cdialog = $multi.data('custom-dialog');
		const $dialog = cdialog ? $(cdialog) : $('<div>').data('title', $multi.data('title'));
		const val2opt = {};

		$multi.find('option').each(function(idx,dom){
			const $opt = $(dom);
			if ($opt.hasClass('js-multiple-ignore')) return;

			const val  = $opt.val();
			val2opt[val] = $opt;
			if (cdialog) return;

			const $label = $('<label>').html( $opt.html() );
			if (lclass !=='' && lclass !== undefined) $label.addClass(lclass)

			$label.prepend(
				$('<input>').attr({
					type:	'checkbox',
					value:	val,
				})
				.prop('checked', $opt.prop('selected'))
			).addClass($opt.data('label-class'));
			$dialog.append( $label );
		});

		msys.show_dialog($dialog, function(flag) {
			if (!flag) return;

			let change;

			$dialog.find('input').each(function(idx,dom){
				const $inp = $(dom);
				const val  = $inp.val();
				const $opt = val2opt[val];
				const flag = $inp.prop('checked');
				if ($inp.hasClass('js-multiple-ignore') || !$opt) return;

				if (flag != $opt.prop('selected')) change=true;
				$opt.prop('selected', flag);
			});
			if (change) $multi.change();
		});

		evt.preventDefault();
		return false;
	});
});

