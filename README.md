# PostCSS Vw [![Build Status][ci-img]][ci]

[PostCSS] plugin VW Postcss plugin.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/nimi/postcss-vw.svg
[ci]:      https://travis-ci.org/nimi/postcss-vw

```css
.foo {
    /* Input example */
    font-size: 20px;
}
```

```css
.foo {
  /* Output example */
  font-size: 3rem;
}
```

## Usage

```js
postcss([ require('postcss-vw') ])
```

See [PostCSS] docs for examples for your environment.
