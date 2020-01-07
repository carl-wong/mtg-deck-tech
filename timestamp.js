var replace = require('replace-in-file');
var moment = require('moment');

var ts = moment().format('YYYY-MM-DD @ HH:mm:ss');
const options = {
	files: 'src/environments/*.ts',
	from: /timestamp: '(.*)'/g,
	to: "timestamp: 'Updated: " + ts + "'",
	allowEmptyPaths: false,
};

try {
	let changedFiles = replace.sync(options);
	console.log('Timestamp: ' + ts);
}
catch (error) {
	console.error('Error occurred:', error);
}