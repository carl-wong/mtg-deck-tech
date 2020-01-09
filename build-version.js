var replace = require('replace-in-file');

var package = require('./package.json');
var buildVersion = package.version;

const envOpt = {
	files: 'src/environments/environment.prod.ts',
	from: /version: '(.*)'/g,
	to: "version: 'v" + buildVersion + "'",
	allowEmptyPaths: false,
};

try {
	let changedFiles = replace.sync(envOpt);
	console.log('Build Version: ' + buildVersion);
}
catch (error) {
	console.error('Error occurred:', error);
}

const faviconOpt = {
	files: 'src/index.html',
	from: /(?<favicon>\bfavicon.ico\?v=)(?<version>[\d.]+)/g,
	to: "favicon.ico?v=" + buildVersion,
	allowEmptyPaths: false,
};

try {
	let changedFiles = replace.sync(faviconOpt);
	console.log('Favicon Version: ' + buildVersion);
}
catch (error) {
	console.error('Error occurred:', error);
}
