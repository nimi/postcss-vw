'use strict';

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var px2vw = function px2vw(pixels, pixelTotal) {
	return pixels / pixelTotal * 100;
};

var toFixed = function toFixed(number, precision) {
	var multiplier = Math.pow(10, precision + 1);
	var wholeNumber = Math.floor(number * multiplier);

	return Math.round(wholeNumber / 10) * 10 / multiplier;
};

var px2rem = function px2rem(rootValue, unitPrecision) {
	return function (m, val) {
		return !val ? m : toFixed(parseFloat(val) / rootValue, unitPrecision) + 'rem';
	};
};

var baseMediaQuery = function baseMediaQuery(maxWidth, layoutWidth, fontSize) {
	return _postcss2.default.parse('@media screen and (max-width: ' + maxWidth + 'px) { \n\t\thtml { font-size: ' + px2vw(fontSize, layoutWidth) + 'vw; }}');
};

var remExists = function remExists(decls, prop, value) {
	return decls.some(function (decl) {
		return decl.prop === prop && decl.value === value;
	});
};

var blacklisted = function blacklisted(blacklist, value) {
	return typeof selector === 'string' ? blacklist.some(function (regex) {
		return value.match(regex);
	}) : null;
};

function postcssVw() {
	var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	var defaultOptions = {
		rootValue: 16,
		unitPrecision: 5,
		replaceDeclaration: true,
		rootSelector: 'html',
		baseFontSize: 16,
		desktopWidth: 1250,
		tabletWidth: 640,
		mobileWidth: 320,
		blacklistProps: [],
		desktopMax: 1250,
		desktopMin: 900,
		tabletMin: 601,
		bodyWidthFix: true
	};

	var o = Object.assign({}, defaultOptions, opts);

	var pxTest = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)px/ig;

	var tabletMax = o.desktopMin - 1;
	var mobileMax = o.tabletMin - 1;

	var mediaScreenDesktop = baseMediaQuery(o.desktopMax, o.desktopWidth, o.baseFontSize);
	var mediaScreenTablet = baseMediaQuery(tabletMax, o.tabletWidth, o.baseFontSize);
	var mediaScreenMobile = baseMediaQuery(mobileMax, o.mobileWidth, o.baseFontSize);

	return function (style) {

		var rootNode = style.nodes[0].parent;

		rootNode.prepend(mediaScreenMobile);
		rootNode.prepend(mediaScreenTablet);
		rootNode.prepend(mediaScreenDesktop);

		style.walkDecls(function (decl, i) {
			var rule = decl.parent;
			var value = decl.value;

			if (value && value.indexOf('px') !== -1) {

				if (Array.isArray(o.blacklistProps) && blacklisted(o.blacklistProps, decl.prop)) {
					return;
				}
				if (typeof o.blacklistProps === 'function' && o.blacklistProps(decl)) {
					return;
				}

				var remValue = value.replace(pxTest, px2rem(o.rootValue, o.unitPrecision));

				if (remExists(rule, decl.prop, remValue)) {
					return;
				}

				if (o.replaceDeclaration) {
					decl.value = remValue;
				} else {
					rule.insertAfter(i, decl.clone({ value: remValue }));
				}
			}
		});

		style.walkAtRules('media', function (mq) {
			if (mq.params === 'screen') {
				var html = _postcss2.default.rule({ selector: 'html' });
				mq.insertBefore('body', html);
				html.append({ prop: 'width', value: '100vw' });
				html.append({ prop: 'margin-left', value: 'calc((100% / 100vw) /2)' });
				html.append({ prop: 'overflow-x', value: 'hidden' });
				html.append({ prop: 'font-size', value: o.baseFontSize * (o.desktopMax / o.desktopWidth) });
			}
		});
	};
}

module.exports = _postcss2.default.plugin('postcss-vw', postcssVw);
