importScripts('js/SW-toolbox.js');

toolbox.precache([
  'css/Normalize.css',
  'css/Main.css',
  'js/PlaybulbCandle.js',
  'js/Companion.js',
  'js/Main.js',
  'index.html',
]);

toolbox.router.default = toolbox.networkFirst;
toolbox.options.networkTimeoutSeconds = 5;
toolbox.router.get('icons/*', toolbox.fastest);