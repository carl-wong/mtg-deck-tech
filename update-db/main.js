function onErr(err) {
	console.log(err);
	return 1;
}

function main() {
	const FUNCTION_ARRAY = [
		['Parse: Card Purchase => Inventory', inventoryImport],
		['Extract: Scryfall Full Oracle => Minimal Oracle', processScryfall],
	];

	const prompt = require('prompt');

	console.log("Starting mtg-tool...");

	let functionList = '';
	for (let i = 0; i < FUNCTION_ARRAY.length; i++) {
		functionList += `${i}. ${FUNCTION_ARRAY[i][0]}\n`;
	}

	prompt.start();
	prompt.get({
		properties: {
			function: {
				description: 'Select function:\n' + functionList,
				default: '0'
			}
		}
	}, function(err, result) {
		if (err) { return onErr(err); }

		const functionIndex = parseInt(result.function);
		FUNCTION_ARRAY[functionIndex][1]();
	});
}

function processScryfall() {
	const BASIC_ATTRS = [
		'cmc',
		'color_identity',
		'colors',
		'layout',
		'name',
		'oracle_id',
		'oracle_text',
		'type_line',
	];

	const prompt = require('prompt');
	const lineByLine = require('n-readlines');

	prompt.start();
	prompt.get({
		properties: {
			file: {
				description: 'Files should be placed in ./input',
				default: 'oracle.json',
			}
		}
	}, function(err, result) {
		if (err) { return onErr(err); }

		const fs = require('fs');

		let rawData = fs.readFileSync('./input/' + result.file);

		let longestValues = {};
		BASIC_ATTRS.forEach(attr => {
			longestValues[attr] = 0;
		})
		longestValues['image_uris'] = 0;

		let cards = JSON.parse(rawData);

		if (Array.isArray(cards)) {
			let output = [];

			for (let iCard = 0; iCard < cards.length; iCard++) {
				const card = cards[iCard];

				// skip tokens
				if (card['layout'].indexOf('token') === -1) {
					let minCard = {};

					// get basic attributes
					BASIC_ATTRS.forEach(attr => {
						let value = card[attr];
						if (value) {
							if (Array.isArray(value)) {
								minCard[attr] = value.join(',');
							} else {
								minCard[attr] = value;
							}

							if (typeof minCard[attr] === 'string') {
								longestValues[attr] = Math.max(longestValues[attr], minCard[attr].length);
							} else {
								longestValues[attr] = Math.max(longestValues[attr], minCard[attr]);
							}
						} else {
							minCard[attr] = null;
						}
					});

					// get image URIs
					let images = [];

					// for flip cards
					if (card['layout'] === 'transform') {
						const faces = card['card_faces'];
						if (faces && Array.isArray(faces)) {
							for (let iFace = 0; iFace < faces.length; iFace++) {
								const face = faces[iFace];
								const faceUris = face['image_uris'];
								if (faceUris && faceUris['normal']) {
									images.push(faceUris['normal']);
								}
							}
						}
					} else {
						const cardUris = card['image_uris'];
						if (cardUris && cardUris['normal']) {
							images.push(cardUris['normal']);
						}
					}

					minCard['image_uris'] = images.join(',');
					longestValues['image_uris'] = Math.max(longestValues['image_uris'], minCard['image_uris'].length);

					// append card to result
					output.push(minCard);
				}
			}

			console.log('Extracted ' + output.length + ' non-token cards from ' + result.file);

			fs.writeFileSync('./output/min-oracle.json', JSON.stringify(output, null, 2));
			console.log('--> min-oracle.json written to output folder');

			fs.writeFileSync('./output/min-oracle-server.json', JSON.stringify({ 'OracleCards': output }, null, 2));
			console.log('--> min-oracle-server.json written to output folder');

			console.log('Longest Values: ');
			console.log(JSON.stringify(longestValues, null, 2));

		} else {
			console.log('Error: expected contents to be an array');
		}

	});
}

function inventoryImport() {
	const STORE_FORMAT_CODES = ['f2f'];

	const prompt = require('prompt');
	const lineByLine = require('n-readlines');

	prompt.start();
	prompt.get({
		properties: {
			store: {
				description: 'Supported store codes: ' + STORE_FORMAT_CODES.join(' / '),
				default: STORE_FORMAT_CODES[0],
			},
			file: {
				description: 'Files should be placed in ./input',
				default: 'input.txt',
			}
		}
	}, function(err, result) {
		if (err) { return onErr(err); }

		if (!result.store) { result.store = STORE_FORMAT_CODES[0]; }
		if (!result.file) { result.file = 'input.txt'; }

		switch (result.store) {
			case 'f2f':
				{
					const PREFIX = ' - ';
					const lineReader = require('line-reader');

					let tally = {};

					lineReader.eachLine('./input/' + result.file, function(line) {
						if (line.substring(0, 3) === PREFIX) {
							const cardCount = parseInt(line.substring(PREFIX.length));

							const lineByComma = line.split(',');
							const suffix = lineByComma[lineByComma.length - 1];

							const cardName = line.substring(line.indexOf('x') + 2, line.length - (suffix.length + 1));

							if (tally[cardName]) { tally[cardName] += cardCount; }
							else { tally[cardName] = cardCount; }
						}
					}, function finished(err) {
						if (err) throw err;
						for (const [key, value] of Object.entries(tally)) {
							console.log(value + ' ' + key);
						}
					});
				}
				break;
			default:
				break;
		}
	});
}

main();