var bundle = require('../node-package/create-bundle.js');
var masterBundle = bundle.js([
		// Replacement for jsonary.js, assembled from individual files
		'../jsonary/_compatability.js',
		'../jsonary/_header.js',
		'../jsonary/uri.js',
		'../jsonary/uri-template.js',
		'../jsonary/utils.js',
		'../jsonary/monitors.js',
		'../jsonary/request.js',
		'../jsonary/patch.js',
		'../jsonary/data.js',
		'../jsonary/schema.js',
		'../jsonary/schemamatch.js',
		'../jsonary/schemaset.js',
		'../jsonary/main.js',
		'../jsonary/_footer.js',
		'../plugins/jsonary.render.js'
	])
	.code('var Jsonary = this.Jsonary;')

	// http://json-schema.org/ meta-schemas
	.js('../jsonary/_cache-json-schema-org.js')

	// Renderers
	.js('../renderers/list-links.js')
	.css('../renderers/common.css')

	.js('../renderers/plain.jsonary.js')
	.css('../renderers/plain.jsonary.css');

console.log("Writing jsonary-core");
masterBundle.compileJs('../node-package/core/jsonary-core.js');
masterBundle.compileJs('../node-package/core/jsonary-core.min.js', true);
masterBundle.compileCss('../node-package/core/jsonary-core.css');
	
	// Plugins
masterBundle.js('../plugins/jsonary.location.js')
	.js('../plugins/jsonary.popup.js')
	.js('../plugins/jsonary.undo.js')
	.js('../plugins/jsonary.jstl.js')
	.js('../plugins/jsonary.render.table.js')
	.css('../plugins/jsonary.render.table.css')
	.js('../plugins/jsonary.render.generate.js')

	.js('../renderers/string-formats.js')
	
	.js('../renderers/contributed/full-preview.js')
	.js('../renderers/contributed/full-instances.js')
	.js('../renderers/contributed/adaptive-table.js');

console.log("Writing jsonary-super-bundle");
masterBundle.compileJs('../node-package/super-bundle/jsonary-super-bundle.js', false, true);
masterBundle.compileJs('../node-package/super-bundle/jsonary-super-bundle.min.js', true, true);
console.log("Jsonary bundles complete");
