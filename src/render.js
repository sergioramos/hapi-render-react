const { renderToNodeStream } = require('react-dom/server');
const React = require('react');

module.exports = (request, { doc, View, props }) => {
  return request.generateResponse(undefined, {
    prepare: response => response.header('content-type', 'text/html'),
    marshal: response => {
      if (doc) {
        return doc(() => React.createElement(View, props), request);
      }

      return renderToNodeStream(
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
  });
};
