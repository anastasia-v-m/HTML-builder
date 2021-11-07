const fs = require('fs');
const path = require('path');
const process = require('process');


let in_Stream, out_Stream;

let inputFile = path.join(__dirname, 'text.txt');

in_Stream = fs.createReadStream(inputFile).setEncoding('utf8');
out_Stream = process.stdout;


in_Stream.on('data', (chunk) => {
  out_Stream.write(chunk);
});

