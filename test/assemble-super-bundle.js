var bundle = require('./create-bundle.js');
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
		'../plugins/jsonary.render.js',
	])
	.code('var Jsonary = this.Jsonary;')

	// Plugins
	.js('../plugins/jsonary.location.js')
	.js('../plugins/jsonary.undo.js')
	.js('../plugins/jsonary.jstl.js')
	.js('../plugins/jsonary.render.table.js')
	.css('../plugins/jsonary.render.table.css')
	.js('../plugins/jsonary.render.generate.js')

	// Renderers
	.js('../renderers/list-links.js')
	.css('../renderers/common.css')

	.js('../renderers/plain.jsonary.js')
	.css('../renderers/plain.jsonary.css')

	.js('../renderers/string-formats.js')
	
	.js('../renderers/contributed/full-preview.js')
	.js('../renderers/contributed/full-instances.js')
	.js('../renderers/contributed/adaptive-table.js');

masterBundle.compileJs('../jsonary-super-bundle.js', false, true);
masterBundle.compileJs('../jsonary-super-bundle.min.js', true, true);