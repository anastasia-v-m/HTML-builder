const fs = require('fs');
const path = require('path');
const process = require('process');
const { pipeline } = require('stream');
const { Transform } = require('stream');

let in_Stream, out_Stream;

let outputFile = path.join(__dirname, 'newtext.txt');
//console.log(outputFile)
in_Stream = process.stdin;
out_Stream = fs.createWriteStream(outputFile);
process.stdout.write('Hello! Type something!\n');

in_Stream.resume();
in_Stream.setEncoding('utf-8');
in_Stream.on('data', (chunk) => {
  console.log(chunk.toString())
  if (chunk.toString().indexOf('exit') >= 0) {
    process.stdout.write('Game over))) Goodbuy!');
    process.exit(1);    
  } else {
    out_Stream.write(chunk);
  }
});

// process.on('exit', () => {
//   process.stdout.write('Game over))) Goodbuy!');
// });
process.on('SIGINT', () => {
  process.stdout.write('Game over))) Goodbuy!');
  process.exit(1);
});
// in_Stream.on('exit', () => {
//   process.stdout.write('Game over))) Goodbuy');
// });
