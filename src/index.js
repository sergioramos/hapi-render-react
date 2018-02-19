const Path = require('path');
const BabelRegister = require('babel-register');

const pkg = require('../package.json');
const Render = require('./render');

const { NODE_ENV = 'development' } = process.env;
const IS_DEVELOPMENT = NODE_ENV === 'development';

exports.plugin = {
  pkg,
  multiple: false,
  once: true,
  register: async (server, { relativeTo }) => {
    const documentPathname = Path.join(relativeTo, '_document');

    BabelRegister({
      only: relativeTo,
      ignore: documentPathname
    });

    const getView = name => {
      const viewPathname = Path.join(relativeTo, name);

      if (IS_DEVELOPMENT) {
        delete require.cache[viewPathname];
        delete require.cache[documentPathname];
      }

      let View;
      let doc;

      try {
        const v = require(viewPathname);
        View = v.default;
      } catch (err) {
        return {};
      }

      try {
        doc = require(documentPathname);
      } catch (err) {
        return { View };
      }

      return {
        View,
        doc
      };
    };

    server.decorate('toolkit', 'render', function(name, props) {
      const { View, doc } = getView(name);
      return Render(this.request, { doc, View, props });
    });

    server.decorate('handler', 'view', (_, { name, props }) => req => {
      const { View, doc } = getView(name);
      return Render(req, { doc, View, props });
    });
  }
};
