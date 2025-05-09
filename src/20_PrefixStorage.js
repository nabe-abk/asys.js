//##############################################################################
// Prefix Storage
//							(C)2019-2025 nabe@abk
//##############################################################################
//
//impliment methods: set(), get(), remove(), clear()
//
/* Add "export" by Makefile */
class PrefixStorage {
	constructor(path) {
		this.ls     = localStorage;
		this.prefix = String(path) + '::';
	}

	set(key, val) {
		this.ls[this.prefix + key] = val;
	}
	get(key) {
		return this.ls[this.prefix + key];
	}
	getInt(key) {
		const x = parseInt(this.ls[this.prefix + key]);
		return isNaN(x) ? 0 : x;
	}
	defined(key) {
		return (this.ls[this.prefix + key] !== undefined);
	}
	remove(key) {
		this.ls.removeItem(this.prefix + key);
	}
	clear = function() {
		const ls  = this.ls;
		const pf  = this.prefix;
		const len = pf.length;

		const ary = [];
		for(let i=0; i<ls.length; i++) {
			const k = ls.key(i);
			if (k.substr(0,len) === pf) ary.push(k);
		}
		// Do not delete in upper loop
		for(var k in ary) {
			delete ls[ary[k]];
		}
	}
}
