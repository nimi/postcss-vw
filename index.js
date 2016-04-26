import postcss from 'postcss';

const px2vw = (pixels, pixelTotal) => pixels / pixelTotal * 100;

const toFixed = (number, precision) => {
	const multiplier = Math.pow(10, precision + 1);
	const wholeNumber = Math.floor(number * multiplier);

	return Math.round(wholeNumber / 10) * 10 / multiplier;
};

const px2rem = (rootValue, unitPrecision) => 
	(m, val) => !val ? m : toFixed((parseFloat(val) / rootValue), unitPrecision) + 'rem';

const baseMediaQuery = (maxWidth, layoutWidth, fontSize) =>
	postcss.parse(
		`@media screen and (max-width: ${maxWidth}px) { 
		html { font-size: ${px2vw(fontSize, layoutWidth)}vw; }}`
	);

const remExists = (decls, prop, value) =>
	decls.some(decl => (decl.prop === prop && decl.value === value));

const blacklisted = (blacklist, value) =>
	typeof selector === 'string' ? blacklist.some(regex => value.match(regex)) : null;

function postcssVw({
	rootValue = 16,
	unitPrecision = 5,
	replace = true,
	rootSelector = 'html',
	baseFontSize = 16,
	desktopWidth = 1250,
	tabletWidth = 640,
	mobileWidth = 320,
	blacklistProps = [],
	desktopMax = 1250,
	desktopMin = 900,
	tabletMin = 601,
	bodyWidthFix = true
}) {
	const pxTest = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)px/ig;

	const tabletMax = desktopMin - 1;
	const mobileMax = tabletMin - 1;

	const mediaScreenDesktop = baseMediaQuery(desktopMax, desktopWidth, baseFontSize);
	const mediaScreenTablet = baseMediaQuery(tabletMax, tabletWidth, baseFontSize);
	const mediaScreenMobile = baseMediaQuery(mobileMax, mobileWidth, baseFontSize);

	return style => {

		var rootNode = style.nodes[0].parent;

		rootNode.prepend(mediaScreenMobile);
		rootNode.prepend(mediaScreenTablet);
		rootNode.prepend(mediaScreenDesktop);

		style.walkDecls(({parent, value}, i) => {
			const rule = parent;

			if (value && value.indexOf('px') !== -1) {

				if (Array.isArray(blacklistProps) && blacklisted(blacklistProps, decl.prop)) { return; }
				if (typeof blacklistProps === 'function' && blacklistProps(decl)) { return; }

				const remValue = value.replace(pxTest, px2rem(rootValue, unitPrecision));

				if (remExists(rule, decl.prop, remValue)) { return; }

				if (replaceDeclaration) {
					decl.value = remValue;
				} else {
					rule.insertAfter(i, decl.clone({ value: remValue }));
				}
			}
		});

		style.walkAtRules('media', mq => {
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
}

module.exports = postcss.plugin('postcss-vw', postcssVw);