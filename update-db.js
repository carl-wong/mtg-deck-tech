const path = require('path');
const fs = require('fs');

const ROOT_DIR = './databases';
const INPUT_DIR = 'input';
const OUTPUT_DIR = 'output';

var moment = require('moment');
var ts = moment().format('YYYY-MM-DD');

function onErr(err) {
  console.log(err);
  return 1;
}

function listFiles(dir, filter) {
  if (!fs.existsSync(dir)) {
    console.warn("no dir ", dir);
    return;
  }

  const output = [];

  const files = fs.readdirSync(dir);
  for (var i = 0; i < files.length; i++) {
    const filename = path.join(dir, files[i]);
    const stat = fs.lstatSync(filename);

    if (stat.isDirectory()) {
      output.concat(listFiles(filename, filter)); // recurse
    } else if (filter.test(filename)) {
      output.push(filename);
    }
  };

  return output;
}

function main() {
  const FUNCTION_ARRAY = [
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

  const jsonFiles = listFiles(path.join(ROOT_DIR, INPUT_DIR), /\.json$/);

  if (jsonFiles.length > 0) {
    let jsonFilesList = '';
    for (let i = 0; i < jsonFiles.length; i++) {
      jsonFilesList += `${i}. ${jsonFiles[i]}\n`;
    }

    prompt.start();
    prompt.get({
      properties: {
        file: {
          description: `Please select an input file:\n` + jsonFilesList,
          default: '0',
        }
      }
    }, function(err, result) {
      if (err) { return onErr(err); }
      const chosenFile = jsonFiles[parseInt(result.file)];

      console.log(`Processing ${chosenFile}...`);

      let rawData = fs.readFileSync(chosenFile);

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

        const outputFile = path.join(ROOT_DIR, OUTPUT_DIR, 'oracle-card_' + ts + '.json');
        fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
        console.log(`--> output written to ${outputFile}`);

        // fs.writeFileSync(`${ROOT_DIR}/output/min-oracle-server.json`, JSON.stringify({ 'OracleCards': output }, null, 2));
        // console.log('--> min-oracle-server.json written to output folder');

        console.log('Longest Values: ');
        console.log(JSON.stringify(longestValues, null, 2));

      } else {
        console.log('Error: expected contents to be an array');
      }
    });
  } else {
    console.log(`No input JSON files detected in ${ROOT_DIR}/${INPUT_DIR}`);
  }
}

main();
