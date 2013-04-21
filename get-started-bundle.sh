#!/bin/sh

php jsonary.js.php > /dev/null

rm -rf get-started-bundle/renderers/
cp -r renderers get-started-bundle

rm get-started-bundle.zip
find get-started-bundle -name .DS_Store -exec rm {} \;
zip -r get-started-bundle.zip get-started-bundle/