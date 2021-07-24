(function() {
  'use strict';
  var workerScript = document.currentScript && document.currentScript.dataset.serviceWorker;

  if (workerScript && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(workerScript);
  }
})();
