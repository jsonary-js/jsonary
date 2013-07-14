#!/bin/sh

php jsonary.js.php > /dev/null

rm -rf get-started-bundle/jsonary.js*
cp jsonary.js get-started-bundle

rm -rf get-started-bundle/renderers/
cp -r renderers get-started-bundle

rm -rf get-started-bundle/plugins/
cp -r plugins get-started-bundle

rm get-started-bundle/LICENSE.txt
cp -r LICENSE.txt get-started-bundle

rm get-started-bundle.zip
find get-started-bundle -name .DS_Store -exec rm {} \;
zip -r get-started-bundle.zip get-started-bundle/