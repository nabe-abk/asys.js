//##############################################################################
// run init for develop mode
//##############################################################################
(function(){
	const $vars = $('#asys-vars');
	const vars  = $$.vars = ($vars.length==1) ? $$.parse_json_html($vars) : {};

	const $msgs = $('#asys-msgs');
	if ($msgs.length==1) {
		const data = $$.parse_json_html($msgs);
		$$.set_msg(data);
	}

	// PrefixStorage
	$$.Storage = new PrefixStorage( vars.myself || '/' );

	// Export
	globalThis[vars.name || 'asys']=$$;

	// dom initalize
	$$.dom_init();
})();

