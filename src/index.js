const Path = require('path');
const { exists } = require('mz/fs');

const pkg = require('../package.json');
const Render = require('./render');

const { NODE_ENV = 'development' } = process.env;
const IS_DEVELOPMENT = NODE_ENV === 'development';

exports.plugin = {
  pkg,
  multiple: false,
  once: true,
  register: async (server, { relativeTo }) => {
    const documentPathname = Path.join(relativeTo, '_document.js');
    const serverErrorPathname = Path.join(relativeTo, 'server-error.js');
    const hasDocument = await exists(documentPathname);
    const hasServerError = await exists(serverErrorPathname);

    const handler = async (request, { name, props }) => {
      const viewPathname = Path.join(relativeTo, name);

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

    server.decorate('toolkit', 'render', function(name, props) {
      return handler(this.request, { name, props });
    });

    server.decorate('handler', 'view', (_, { name, props }) => req => {
      return handler(req, { name, props });
    });
  }
};
