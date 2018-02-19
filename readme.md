# hapi-render-react

[![npm](https://img.shields.io/npm/v/hapi-render-react.svg?style=flat-square)](https://www.npmjs.com/package/hapi-render-react)
[![License: BSD 3-clause "New" or "Revised" License](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg?style=flat-square)](https://opensource.org/licenses/BSD-3-Clause)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

[![David](https://img.shields.io/david/ramitos/hapi-render-react.svg?style=flat-square)](https://david-dm.org/ramitos/hapi-render-react)
[![David](https://img.shields.io/david/dev/ramitos/hapi-render-react.svg?style=flat-square)](https://david-dm.org/ramitos/hapi-render-react?type=dev)
[![David](https://img.shields.io/david/peer/ramitos/hapi-render-react.svg?style=flat-square)](https://david-dm.org/ramitos/hapi-render-react?type=peer)

## Table of Contents

* [Install](#install)
* [Usage](#usage)
  * [\_document](#_document)
* [License](#license)

## Install

```
yarn add hapi-render-react
```

```
npm install hapi-render-react
```

## Usage

```js
const { Server } = require('hapi');
const Main = require('apr-main');
const RenderReact = require('hapi-render-react');
const Path = require('path');

const { PORT = 3001 } = process.env;

const server = new Server({
  port: PORT
});

Main(async () => {
  await server.register({
    plugin: RenderReact,
    options: {
      relativeTo: Path.join(__dirname, 'views')
    }
  });

  await server.initialize();

  server.route({
    method: 'GET',
    path: '/',
    handler: {
      view: {
        name: 'home',
        props: {
          hello: 'world'
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/hello',
    handler: (request, h) => {
      return h.render('hello', { name: 'world' });
    }
  });

  await server.start();

  // eslint-disable-next-line no-console
  console.log(`Server started at ${server.info.uri}`);
});
```

_pages/home.js_:

```js
import React from 'react';

export default ({ hello }) => <p>Hello {hello}</p>;
```

_pages/hello.js_:

```js
import React from 'react';

export default ({ name }) => <p>Hello {name}</p>;
```

## \_document

_inspired by [Next.js](https://github.com/zeit/next.js#custom-document)._

You can customize how a view is rendered. Example of a \__document_ to support React-Helmet:

```js
const React = require('react');
const { HelmetProvider } = require('react-helmet-async');
const { renderToString, renderToNodeStream } = require('react-dom/server');

module.exports = View => {
  const helmetContext = {};

  const appHtml = renderToString(
    React.createElement(
      HelmetProvider,
      { context: helmetContext },
      React.createElement(View)
    )
  );

  const { helmet } = helmetContext;

  const {
    bodyAttributes,
    htmlAttributes,
    link,
    meta,
    noscript,
    script,
    style,
    title
  } = helmet;

  const htmlAttrs = htmlAttributes.toString();
  const bodyAttrs = bodyAttributes.toString();

  const bodyHtml = renderToString(
    React.createElement(React.Fragment, null, [
      link.toComponent(),
      noscript.toComponent(),
      style.toComponent(),
      script.toComponent()
    ])
  );

  return renderToNodeStream(
    React.createElement('html', htmlAttrs, [
      React.createElement('head', null, [
        meta.toComponent(),
        title.toComponent()
      ]),
      React.createElement(
        'body',
        Object.assign(bodyAttrs, {
          dangerouslySetInnerHTML: {
            __html: appHtml + bodyHtml
          }
        })
      )
    ])
  );
};
```

## License

BSD-3-Clause
