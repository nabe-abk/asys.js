//##############################################################################
//extend global
//##############################################################################
////////////////////////////////////////////////////////////////////////////////
// String chop
////////////////////////////////////////////////////////////////////////////////
String.prototype.chop = function() {
	return this.slice(0,-1);
}

////////////////////////////////////////////////////////////////////////////////
// String tr
////////////////////////////////////////////////////////////////////////////////
String.prototype.tr = function(_s1, _s2) {
	function expand(str) {
		if (str == undefined) return '';
		return str.replace(/(.)\-(.)/g, function(ma,$1,$2){
			const s = $1.charCodeAt(0);
			const e = $2.charCodeAt(0);
			let x='';
			for(let i=s,c=0; i<=e && c<5000; i++,c++) {
				x += String.fromCharCode(i);
			}
			return x;
		});
	}
	const s1 = expand(_s1);
	const s2 = expand(_s2);
	if (s1.length != s2.length) {
		throw('String.tr() not match pattern length');
	}

	return this.split('').map(function(c) {
		const i = s1.indexOf(c);
		if (i<0) return c;
		return s2[i];
	}).join('');
}

