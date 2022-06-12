//############################################################################
// dom extentions
//############################################################################
//////////////////////////////////////////////////////////////////////////////
// popup-help
//////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	const $popup_div = $('<div>').addClass('popup-block');
	this.$popup_div  = $popup_div;
	this.$body.append( $popup_div );
	const self = this;

	const help = '.help[data-help]';
	this.$body.on('mouseover', help, {
		show: function(evt, $obj, $div){
			const text = self.tag_esc_br( $obj.data("help") );
			$div.addClass('popup popup-help');
			$div.html( text );
		}
	}, function(evt){ self.popup(evt) });
});

//////////////////////////////////////////////////////////////////////////////
// button for link
//////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	this.$body.on('click', 'button[data-href]', function(evt){
		location.href = $(evt.target).data('href');
	});
});

//////////////////////////////////////////////////////////////////////////////
// button for value set to form element
//////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	this.$body.on('click', 'button.js-set-value[data-target]', function(evt){
		const $btn = $(evt.target);
		$($btn.data('target')).val( $btn.attr('value') );
	});
});

//////////////////////////////////////////////////////////////////////////////
// do not submit by enter key
//////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	this.$body.on('keypress', 'input.no-enter-submit, form.no-enter-submit input', function(evt){
		if (evt.which === 13) return false;
		return true;
	});
});

//////////////////////////////////////////////////////////////////////////////
// file upload button
//////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	this.$body.on('click', 'button.js-file-btn', function(evt) {
		const $obj = $(evt.target);
		const $tar = $($obj.data('target'));
		if (! $tar.length ) return;
		$tar.click();
	});
});
//////////////////////////////////////////////////////////////////////////////
// file reset button
//////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	this.$body.on('click', 'button.js-reset-btn', function(evt) {
		const $obj = $(evt.target);
		const $tar = $($obj.data('target'));
		if (!$tar.length || $tar.val()=='') return;
		$tar.val('').change();
	});
});

//////////////////////////////////////////////////////////////////////////////
// check all
//////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	this.$body.on('change', 'input.js-checked', function(evt){
		const $obj   = $(evt.target);
		const target = $obj.data( 'target' );
		$(target).prop("checked", $obj.is(":checked"));
	});
});

//////////////////////////////////////////////////////////////////////////////
// submit on change
//////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	this.$body.on('change', '.js-on-change-submit', function(evt){
		const $obj = $(evt.target);
		$obj.parentsOne('form').submit();
	});
});

//////////////////////////////////////////////////////////////////////////////
// line click for check on table
//////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	this.$body.on('click', 'tbody.js-line-checked', function(evt){
		const $obj = $(evt.target);
		const $pars= $obj.parents('tr');
		if ($pars.add($obj).filter('a,input,button,label,.line-checked-cancel').length) return;

		const $tr  = $pars.last();
		const $inp = $tr.find('input[type="checkbox"],input[type="radio"]');
		$inp.first().click();
	});
});

//////////////////////////////////////////////////////////////////////////////
// combo box
//////////////////////////////////////////////////////////////////////////////
// used by select.js-save
$$.js_combo_dummy_val  = "\e\e\e\e\e\n\n";
$$.set_value_on_select = function($select, val) {
	$select.val( val );
	if ($select.val() != val) {
		const format = $select.data('format') || '%v';
		const text = format.replace(/%v/g, val);
		const $opt = $('<option>').attr('value', val).text( text );
		$select.append( $opt );
		$select.val( val );
	}
	$select.change();
}

$$.init(function(){
	const self  = this;
	const dummy = this.js_combo_dummy_val;

	function change_select(evt) {
		const $select = $(evt.target);
		const val     = $select.val();

		if (val !== dummy)
			return $select.data('current', val);
		$select.val( $select.data('current') );

		const $target = $( $select.data('target') ).clone(true).removeAttr('id');
		$target.find('input').attr('name', 'data');

		self.form_dialog({
			title: $target.data('title'),
			elements: [
				{ type: '*', html: $target }
			],
			callback: function(h) {
				const val = h.data;
				if (val == '' || $select.val() == val) return;

				self.set_value_on_select( $select, val );
				$select.data('current', val);
			}
		});
	}

	// initalize
	this.$body.on('focus', 'select.js-combo', function(evt){
		const $obj = $(evt.target);
		$obj.data('current', $obj.val() );

		if ($obj.find('option[value="' + dummy + '"]').length) return;
		// add other option
		const $opt = $('<option>').attr('value', dummy).text( self.msg('other') );
		$obj.append( $opt );

		$obj.on('change', change_select );
	});
})

