////////////////////////////////////////////////////////////////////////////////
// make main object
////////////////////////////////////////////////////////////////////////////////
/* Add "export" by Makefile */
const $$ = {
	SameSite:		'Lax',	// set_cookie() default
	DefaultShowSpeed:	300,	// msec
	TouchDnDTime:		100,	// msec
	DoubleTapTime:		400,	// msec
	PopupDelayTime:		300,	// msec
	PopupOffsetX:		 15,
	PopupOffsetY:		 10,

	$head:		$('head'),
	$body:		$('body')
};

////////////////////////////////////////////////////////////////////////////////
// load message
////////////////////////////////////////////////////////////////////////////////
$$.msg = function(key, _default) {
	const msgs = this.msgs || {};
	const msg  = this.msgs[key];
	return (msg === undefined) ? (_default || key.toUpperCase()) : msg;
}

$$.set_msg = function(obj, msg) {
	const msgs = this.msgs ||= {};

	if (typeof(obj) != 'object') {
		msgs[obj] = msg;
		return;
	}
	this.msgs = { ...msgs, ...obj };
}
