//##############################################################################
// dom extentions
//##############################################################################
////////////////////////////////////////////////////////////////////////////////
// css-defer load
////////////////////////////////////////////////////////////////////////////////
$('link.css-defer').attr('rel', 'stylesheet');

////////////////////////////////////////////////////////////////////////////////
// popup-help
////////////////////////////////////////////////////////////////////////////////
$$.$body.on('mouseover', '.help[data-help]', {
	show: function(evt, $obj, $div){
		const text = $$.tag_esc_br( $obj.data("help") );
		$div.addClass('popup popup-help');
		$div.html( text );
	}
}, function(evt){ $$.popup(evt) });

////////////////////////////////////////////////////////////////////////////////
// button for link
////////////////////////////////////////////////////////////////////////////////
$$.$body.on('click', 'button[data-href]', function(evt){
	location.href = $(evt.target).data('href');
});

////////////////////////////////////////////////////////////////////////////////
// button for value set to form element
////////////////////////////////////////////////////////////////////////////////
$$.$body.on('click', 'button.js-set-value[data-target]', function(evt){
	const $btn = $(evt.target);
	$.secure($btn.data('target')).val( $btn.attr('value') );
});

////////////////////////////////////////////////////////////////////////////////
// do not submit by enter key
////////////////////////////////////////////////////////////////////////////////
$$.$body.on('keypress', 'input.no-enter-submit, form.no-enter-submit input', function(evt){
	if (evt.which === 13) return false;
	return true;
});

////////////////////////////////////////////////////////////////////////////////
// file upload button
////////////////////////////////////////////////////////////////////////////////
// <button class="js-file-btn" data-target="#fileup">
// <input type="file" id="fileup" style="display:none" data-target="#file-list">
// <span id="file-list"></span>
//
$$.$body.on('click', 'button.js-file-btn', function(evt) {
	const $obj = $(evt.target);
	const $tar = $.secure($obj.data('target'));
	if (! $tar.length ) return;

	if ($tar.data('target') && !$tar.data('--regist-change-evt')) {
		$tar.data('--regist-change-evt', true);
		$tar.on('change', function(evt){
			const $span = $tar.rootfind( $tar.data('target') );
			const file  = $tar.val().replace(/^.*?([^\\\/]*)$/, "$1");
			$span.text( file );
		})
	}

	$tar.click();
});

////////////////////////////////////////////////////////////////////////////////
// file reset button
////////////////////////////////////////////////////////////////////////////////
$$.$body.on('click', 'button.js-reset-btn', function(evt) {
	const $obj = $(evt.target);
	const $tar = $.secure($obj.data('target'));
	if (!$tar.length || $tar.val()=='') return;
	$tar.val('').change();
});

////////////////////////////////////////////////////////////////////////////////
// check all
////////////////////////////////////////////////////////////////////////////////
$$.$body.on('change', 'input.js-checked', function(evt){
	const $obj = $(evt.target);
	const $tar = $.secure($obj.data('target'));
	$tar.prop("checked", $obj.is(":checked"));
});

////////////////////////////////////////////////////////////////////////////////
// submit on change
////////////////////////////////////////////////////////////////////////////////
$$.$body.on('change', '.js-on-change-submit', function(evt){
	const $obj = $(evt.target);
	$obj.parentsOne('form').trigger('submit');
});

////////////////////////////////////////////////////////////////////////////////
// line click for check on table
////////////////////////////////////////////////////////////////////////////////
$$.$body.on('click', 'tbody.js-line-checked', function(evt){
	const $obj = $(evt.target);
	const $pars= $obj.parents('tr');
	if ($pars.add($obj).filter('a,input,button,label,.line-checked-cancel').length) return;

	const $tr  = $pars.last();
	const $inp = $tr.find('input[type="checkbox"],input[type="radio"]');
	$inp.first().click();
});

////////////////////////////////////////////////////////////////////////////////
// combo box
////////////////////////////////////////////////////////////////////////////////
// used by select.js-save

$$.js_combo_dummy = "\e\e\e\e\e\n\n";

$$.$body.on('focus', 'select.js-combo', function(evt){
	const $obj = $(evt.target);
	$obj.data('current', $obj.val() );

	if ($obj.find('option[value="' + dummy + '"]').length) return;
	// add other option
	const $opt = $('<option>').attr('value', dummy).text( $$.msg('other') );
	$obj.append( $opt );
	$obj.on('change', async function(evt) {
		const $select = $(evt.target);
		const _val    = $select.val();
		if (_val !== dummy)
			return $select.data('current', _val);
		
		const val = $select.data('current');
		$select.val( val );

		const element = { name: 'data', value: val, class: $select.data('class') };
		const format  = $select.data('format') || '';
		const ma = format.match(/^(.*)%v(.*)$/);
		if (ma) {
			element.before = ma[1];
			element.after  = ma[2];
		}

		const h = await $$.form_dialog($select.data('title'), element);
		if (h) {
			const val = h.data;
			if (val == '' || $select.val() == val) return;

			// set value
			$select.val( val );
			if ($select.val() != val) {
				const format = $select.data('format') || '%v';
				const text = format.replace(/%v/g, val);
				const $opt = $('<option>').attr('value', val).text( text );
				$select.append( $opt );
				$select.val( val );
			}
			$select.data('current', val);
			$select.change();
		}
	});
});

////////////////////////////////////////////////////////////////////////////////
// sortable table
////////////////////////////////////////////////////////////////////////////////
$$.$body.on('click', 'table.js-sortable-value thead', function(evt){
	const $o1  = $(evt.target).filter('th,td');
	const $obj = $o1.length ? $o1 : $(evt.target).parentsOne('th,td');
	if ($obj.hasClass('disable-sort')) return;

	let cnt=0;
	let $x = $obj;
	while($x.length) {
		$x = $x.prev();
		cnt++;
	}

	const $tbody  = $obj.parentsOne('table').children('tbody');
	const td_nth  = 'td:nth-child(' + cnt + ')';
	const reverse = $tbody.data('_sortable_prev_cnt') == cnt;
	$tbody.data('_sortable_prev_cnt', reverse ? -1 : cnt);

	$tbody.each(function(idx,dom){
		const $tbody = $(dom);
		let   isNum  = true;
		const lines  = [];
		$tbody.children('tr').each(function(i2,tr){
			const $tr = $(tr);
			const $td = $tr.children(td_nth);
			const val = $td.existsData('sort') ? $td.data('sort') : $td.text().replace(/^\s+/, '').replace(/\s+$/, '');
			const num = Number(val);
			if (isNaN(num)) isNum = false;

			lines.push({
				val:	val,
				num:	num,
				$tr:	$tr
			});
		});

		if (isNum) lines.sort(function(a,b){ return a.num - b.num; });
		      else lines.sort(function(a,b){ return a.val===b.val ? 0 : a.val < b.val; });
		if (reverse) lines.reverse();

		$tbody.empty();
		for(let i in lines) $tbody.append(lines[i].$tr);
	});
});
