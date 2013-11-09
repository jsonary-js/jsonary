#!/bin/bash
supervisor --watch .,../jsonary,../plugins,../renderers,../node-package --ignore public/bundle.js,../node-package/core,../node-package/super-bundle site.js