const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const process = require('process');

let arr = [];


async function readDir(pathToDir) {
  const files = await fsPromises.readdir(pathToDir);
  for (const fileName of files) {
    let pathToMyFile = path.join(pathToDir, fileName);
    let fileData = await fileInfo(pathToMyFile);
    
    if (!fileData.isDir) {
      let fileExt = fileData.ext;
      if (fileExt === 'css') {
        await toArr(pathToMyFile);
      }
    }
  }
}

async function fileInfo(pathToMyFile) {
  const info = await fsPromises.lstat(pathToMyFile);
  return info;
}

async function toArr(pathToCSS) {
  console.log(pathToCSS)
  let in_Stream = fs.createReadStream(pathToCSS).setEncoding('utf8');
  in_Stream.on('data', (chunk) => {
    arr.push(chunk.toString());
    process.stdout.write(chunk)
  });  
}

async function toBandle(out_Stream) {
  for (let i = 0; i < arr.length; i++) {
    await out_Stream.write(arr[i]);
  }  
}

async function prepareOutput(file) {
  let isFile = await filePresents(file);  
  if (isFile) {
    await delFile(file);  
  }
}

async function delFile(file) {
  fs.unlink(file, err => {
    if (err) throw err;
  });  
}

async function filePresents(file) {
  fs.stat(file, function(err) {
    if (err) {
      return false;
    } else {
      return true;
    }
});
}

try {
  let outputFile = path.join(__dirname, 'project-dist', 'bundle.css');
  
  prepareOutput(outputFile);
 
  let out_Stream = fs.createWriteStream(outputFile);
  let styledDir = path.join(__dirname, 'styles');
  readDir(styledDir);
  toBandle(out_Stream);

} catch (err) {
  console.error(err);
}