var replace = require('replace-in-file');
var package = require('./package.json');

var buildVersion = package.version;
const options = {
	files: 'src/environments/environment.prod.ts',
	from: /version: '(.*)'/g,
	to: "version: '" + buildVersion + "'",
	allowEmptyPaths: false,
};

try {
	let changedFiles = replace.sync(options);
	console.log('Build Version: ' + buildVersion);
}
catch (error) {
	console.error('Error occurred:', error);
}