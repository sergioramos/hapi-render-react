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

## License

BSD-3-Clause
