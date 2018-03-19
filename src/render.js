const { renderToNodeStream } = require('react-dom/server');
const React = require('react');
const IsPromise = require('p-is-promise');
const IsString = require('lodash.isstring');
const IsStream = require('is-stream');
const GetStream = require('get-stream');
const { writeFile } = require('mz/fs');

const { NODE_ENV = 'development' } = process.env;
const IS_DEVELOPMENT = NODE_ENV === 'development';

const writeStatic = async (res, htmlPathname) => {
  let html;

  if (IsString(res)) {
    html = res;
  } else if (IsPromise(res)) {
    html = await res;
  } else if (IsStream(res)) {
    html = await GetStream(res);
  }

  await writeFile(htmlPathname, html, 'utf-8');
};

module.exports = (request, { View, dynamic, htmlPathname, doc, props }) => {
  return request.generateResponse(undefined, {
    prepare: response => response.header('content-type', 'text/html'),
    marshal: async response => {
      let res;

      if (doc) {
        res = doc(request, response, () => React.createElement(View, props));
      } else {
        res = renderToNodeStream(
          React.createElement('html', null, [
            React.createElement('head', { key: 'head' }),
            React.createElement(
              'body',
              { key: 'body' },
              React.createElement(View, props)
            )
          ])
        );
      }

      if (!IS_DEVELOPMENT && !dynamic) {
        await writeStatic(res, htmlPathname);
      }

      return res;
    }
  });
};
