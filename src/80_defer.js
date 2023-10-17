////////////////////////////////////////////////////////////////////////////////
// "script-defer" and "css-defer"
////////////////////////////////////////////////////////////////////////////////
$$.init(function(){
	const self=this;

	// css-defer
	$('link.css-defer').attr('rel', 'stylesheet');

	function run_script(tag) {
		const $scripts = $(tag);
		$scripts.each(function(idx, dom) {
			const ma  = dom.outerHTML.match(/^(.*?)>/);
			const scr = document.createElement('script');
			scr.innerHTML = (ma ? '// ' + ma[1] + ">\n" : '') + dom.innerHTML;
			dom.innerHTML = '';
			dom.appendChild(scr);
		});
	}
	// script-const, Run just time
	run_script('script-const, script[type="js-const"]');

	// script-defer, Run after all js file's $() function
	$(function(){
		run_script('script-defer, script[type="js-defer"]');
	});
});
