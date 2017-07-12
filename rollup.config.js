export default {
	entry: 'src/Ddls.js',
	indent: '\t',
	// sourceMap: true,
	targets: [
		{
			format: 'umd',
			moduleName: 'DDLS',
			dest: 'build/ddls.js'
		},
		{
			format: 'es',
			dest: 'build/ddls.module.js'
		}
	]
};
