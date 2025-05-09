//##############################################################################
// subroutines
//##############################################################################
////////////////////////////////////////////////////////////////////////////////
// load script
////////////////////////////////////////////////////////////////////////////////
(function(){
	const inc = {};

	$$.load_script = function(url) {
		return new Promise((resolve, reject) => {
			const x=inc[url];
			if (x) {
				if (x===1) return resolve();
				// now loading
				x.on('load', resolve);
				return;
			}

			const $s = inc[url]
				 = $(document.createElement('script'))
				.attr('src',   url)
				.prop('async', true);
			$s.on('load', (evt) => {
				inc[url] = 1;
				resolve(evt);
			});
			this.$head[0].appendChild( $s[0] );
		});
	}
})();

////////////////////////////////////////////////////////////////////////////////
// escape html tag
////////////////////////////////////////////////////////////////////////////////
$$.tag_esc = function(text) {
	return text
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}
$$.tag_esc_br = function(text) {
	return this.tag_esc(text).replace(/\n|\\n/g,'<br>');
}
$$.tag_esc_amp = function(text) {
	return this.tag_esc( text.replace(/&/g,'&amp;') );
}
$$.tag_unesc = function(text) {
	return text
		.replace(/&apos;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&gt;/g, '>')
		.replace(/&lt;/g, '<')
		.replace(/&#92;/g, "\\")	// for JSON data
}
$$.tag_unesc_amp = function(text) {
	return this.tag_unesc(text).replace(/&amp;/g,'&');
}

////////////////////////////////////////////////////////////////////////////////
// Cookie
////////////////////////////////////////////////////////////////////////////////
$$.set_cookie = function(name, val) {
	document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(val) + '; SameSite=' + this.SameSite + ';';
}
$$.get_cookie = function(name) {
	const ary = document.cookie.split(/; */);
	for(const v of ary) {
		const x = v.split('=', 2);
		const k = decodeURIComponent( x[0] );
		if (name != k) continue;
		return decodeURIComponent( x[1] );
	}
	return;
}

////////////////////////////////////////////////////////////////////////////////
// parse JSON in html comment
////////////////////////////////////////////////////////////////////////////////
$$.parse_json_html = function($obj) {
	const json = $obj.html().replace(/^\s*<!--\s*/, '').replace(/\s*-->\s*$/, '');
	return JSON.parse(json);
}

////////////////////////////////////////////////////////////////////////////////
// file size format
////////////////////////////////////////////////////////////////////////////////
$$.format_size = function(s) {
	if (s > 107374182400)		// 100GB
		return Math.round(s/1073741824).toLocaleString() + ' GB';
	if (s > 1047527424) return ( s/1073741824 ).toPrecision(3) + ' GB';
	if (s >    1022976) return ( s/1048576    ).toPrecision(3) + ' MB';
	if (s >        999) return ( s/1024       ).toPrecision(3) + ' KB';
	return s + ' Byte';
}

////////////////////////////////////////////////////////////////////////////////
// to int, float
////////////////////////////////////////////////////////////////////////////////
$$.int = function(s) {
	const x = parseInt(s);
	return isNaN(x) ? 0 : x;
}
$$.float = function(s) {
	const x = parseFloat(s);
	return isNaN(x) ? 0 : x;
}
