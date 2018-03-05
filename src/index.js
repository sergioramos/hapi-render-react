const Path = require('path');
const { exists } = require('mz/fs');

const pkg = require('../package.json');
const Render = require('./render');

const { NODE_ENV = 'development' } = process.env;
const IS_DEVELOPMENT = NODE_ENV === 'development';

exports.plugin = {
  pkg,
  register: async (server, rootOptions) => {
    const handler = async (request, { name, props, relativeTo }) => {
      const documentPathname = Path.join(relativeTo, '_document.js');
      const serverErrorPathname = Path.join(relativeTo, 'server-error.js');
      const viewPathname = Path.join(relativeTo, name);

      const hasDocument = await exists(documentPathname);
      const hasServerError = await exists(serverErrorPathname);

      if (IS_DEVELOPMENT) {
        delete require.cache[viewPathname];
        delete require.cache[documentPathname];
      }

      let View;
      let doc;

      try {
        View = require(viewPathname).default;
      } catch (err) {
        // what to do with this err?
        // eslint-disable-next-line no-console
        console.error(err);

        if (hasServerError && name !== 'server-error') {
          return handler(request, { name: 'server-error', props });
        }

        throw err;
      }

      try {
        doc = require(documentPathname);
      } catch (err) {
        if (hasDocument) {
          throw err;
        }
      }

      return Render(request, { View, doc, props });
    };

    server.decorate('toolkit', 'render', function(name, props, options) {
      return handler(this.request, Object.assign(rootOptions, options, { name, props }));
    });

    server.decorate('handler', 'view', (_, { name, props, ...options }) => req => {
      return handler(req, Object.assign(rootOptions, options, { name, props }));
    });
  }
};
