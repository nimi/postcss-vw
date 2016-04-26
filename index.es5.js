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

function postcssVw(_ref) {
	var _ref$rootValue = _ref.rootValue;
	var rootValue = _ref$rootValue === undefined ? 16 : _ref$rootValue;
	var _ref$unitPrecision = _ref.unitPrecision;
	var unitPrecision = _ref$unitPrecision === undefined ? 5 : _ref$unitPrecision;
	var _ref$replace = _ref.replace;
	var replace = _ref$replace === undefined ? true : _ref$replace;
	var _ref$rootSelector = _ref.rootSelector;
	var rootSelector = _ref$rootSelector === undefined ? 'html' : _ref$rootSelector;
	var _ref$baseFontSize = _ref.baseFontSize;
	var baseFontSize = _ref$baseFontSize === undefined ? 16 : _ref$baseFontSize;
	var _ref$desktopWidth = _ref.desktopWidth;
	var desktopWidth = _ref$desktopWidth === undefined ? 1250 : _ref$desktopWidth;
	var _ref$tabletWidth = _ref.tabletWidth;
	var tabletWidth = _ref$tabletWidth === undefined ? 640 : _ref$tabletWidth;
	var _ref$mobileWidth = _ref.mobileWidth;
	var mobileWidth = _ref$mobileWidth === undefined ? 320 : _ref$mobileWidth;
	var _ref$blacklistProps = _ref.blacklistProps;
	var blacklistProps = _ref$blacklistProps === undefined ? [] : _ref$blacklistProps;
	var _ref$desktopMax = _ref.desktopMax;
	var desktopMax = _ref$desktopMax === undefined ? 1250 : _ref$desktopMax;
	var _ref$desktopMin = _ref.desktopMin;
	var desktopMin = _ref$desktopMin === undefined ? 900 : _ref$desktopMin;
	var _ref$tabletMin = _ref.tabletMin;
	var tabletMin = _ref$tabletMin === undefined ? 601 : _ref$tabletMin;
	var _ref$bodyWidthFix = _ref.bodyWidthFix;
	var bodyWidthFix = _ref$bodyWidthFix === undefined ? true : _ref$bodyWidthFix;

	var pxTest = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)px/ig;

	var tabletMax = desktopMin - 1;
	var mobileMax = tabletMin - 1;

	var mediaScreenDesktop = baseMediaQuery(desktopMax, desktopWidth, baseFontSize);
	var mediaScreenTablet = baseMediaQuery(tabletMax, tabletWidth, baseFontSize);
	var mediaScreenMobile = baseMediaQuery(mobileMax, mobileWidth, baseFontSize);

	return function (style) {

		var rootNode = style.nodes[0].parent;

		rootNode.prepend(mediaScreenMobile);
		rootNode.prepend(mediaScreenTablet);
		rootNode.prepend(mediaScreenDesktop);

		style.walkDecls(function (_ref2, i) {
			var parent = _ref2.parent;
			var value = _ref2.value;

			var rule = parent;

			if (value && value.indexOf('px') !== -1) {

				if (Array.isArray(blacklistProps) && blacklisted(blacklistProps, decl.prop)) {
					return;
				}
				if (typeof blacklistProps === 'function' && blacklistProps(decl)) {
					return;
				}

				var remValue = value.replace(pxTest, px2rem(rootValue, unitPrecision));

				if (remExists(rule, decl.prop, remValue)) {
					return;
				}

				if (replaceDeclaration) {
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
				html.append({ prop: 'font-size', value: baseFontSize * (desktopMax / desktopWidth) });
			}
		});
	};
}

module.exports = _postcss2.default.plugin('postcss-vw', postcssVw);
