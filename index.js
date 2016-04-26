import postcss from 'postcss';

var px2vw = (pixels, pixelTotal) => pixels / pixelTotal * 100;

const toFixed = (number, precision) => {
	const multiplier = Math.pow(10, precision + 1);
	const wholeNumber = Math.floor(number * multiplier);

	return Math.round(wholeNumber / 10) * 10 / multiplier;
};

const px2rem = (m, val) => !val ? m : toFixed((parseFloat(val) / rootValue), unitPrecision) + 'rem';

const baseMediaQuery = (maxWidth, layoutWidth, fontSize) =>
	postcss.parse(
	  ['@media screen and (max-width: ', maxWidth, 'px) {',
	    'html { font-size:', px2vw(fontSize, layoutWidth), 'vw; }',
	  '}'].join('')
	);

function remExists(decls, prop, value) {
	return decls.some(function (decl) {
	    return (decl.prop === prop && decl.value === value);
	});
}

function blacklisted(blacklist, value) {
	return typeof selector === 'string' ? 
	  	blacklist.some(function (regex) { return value.match(regex); }) : null;
}

module.exports = postcss.plugin('postcss-vw', function (options) {
	let pxTest = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)px/ig;

	var o = options || {};
	var rootValue = o.rootValue || 16;
	var unitPrecision = o.unitPrecision || 5;
	var replaceDeclaration = o.replace || true;
	var rootSelector = o.rootSelector || 'html';
	var baseFontSize = o.baseFontSize || 16;
	var desktopWidth = o.desktopWidth || 1250;
	var tabletWidth = o.tabletWidth || 640;
	var mobileWidth = o.mobileWidth || 320;

	var blacklistProps = o.blacklistProps || [];

	var desktopMax = o.desktopMax || 1250;
	var desktopMin = o.desktopMin || 900;
	var tabletMax = desktopMin - 1;
	var tabletMin = o.tabletMin || 601;
	var mobileMax = tabletMin - 1;

	var bodyWidthFix = o.bodyWidthFix || true;

	var mediaScreenDesktop = baseMediaQuery(desktopMax, desktopWidth, baseFontSize);
	var mediaScreenTablet = baseMediaQuery(tabletMax, tabletWidth, baseFontSize);
	var mediaScreenMobile = baseMediaQuery(mobileMax, mobileWidth, baseFontSize);

	return function(style) {

		var rootNode = style.nodes[0].parent;

		rootNode.prepend(mediaScreenMobile);
		rootNode.prepend(mediaScreenTablet);
		rootNode.prepend(mediaScreenDesktop);

		style.walkDecls(function(decl, i) {
		  var rule = decl.parent;
		  var value = decl.value;
		  var remValue;

		  if (value && value.indexOf('px') !== -1) {

		    if (Array.isArray(blacklistProps) && blacklisted(blacklistProps, decl.prop)) { return; }
		    if (typeof blacklistProps === 'function' && blacklistProps(decl)) { return; }

		    remValue = value.replace(pxTest, px2rem);

		    if (remExists(rule, decl.prop, remValue)) { return; }

		    if (replaceDeclaration) {
		      decl.value = remValue; 
		    } else {
		      rule.insertAfter(i, decl.clone({ value: remValue }));
		    }
		  }
		});

		style.walkAtRules('media', function(mq) {
			if (mq.params === 'screen') {
				var html = postcss.rule({ selector: 'html'});
				mq.insertBefore('body', html);
				html.append({ prop: 'width', value: '100vw' });
				html.append({ prop: 'margin-left', value: 'calc((100% / 100vw) /2)' });
				html.append({ prop: 'overflow-x', value: 'hidden' });
				html.append({ prop: 'font-size', value: baseFontSize * (desktopMax / desktopWidth) });
			}
		});
	};
});
