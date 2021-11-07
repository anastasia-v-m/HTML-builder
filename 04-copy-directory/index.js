const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');

const dirToMake = path.join(__dirname, 'files-copy');

async function makeDir() {
  let isFolder = await folderPresents();
  if (isFolder) {
    fs.readdir(dirToMake, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        fs.unlink(path.join(dirToMake, file), err => {
          if (err) throw err;
        });
      }
    });
  } else {
    fs.mkdir(dirToMake, { recursive: false }, (err) => {
      if (err) throw err;
    });
  }
}

async function copyFiles(pathToDir) {
  let initFolder = path.join(pathToDir, 'files');
  const files = await fsPromises.readdir(initFolder);
  for (const fileName of files) {
    let pathToMyFile = path.join(initFolder, fileName);
    let isDir = await fileInfo(pathToMyFile);
    
    if (!isDir) {
      let fileFrom = path.join(initFolder, fileName);
      let fileTo = path.join(dirToMake, fileName);
      fs.copyFile(fileFrom, fileTo, (err) => {
        if (err) throw err;  
      });
    }
  }
}

async function fileInfo(pathToMyFile) {
  const info = await fsPromises.lstat(pathToMyFile);
  return info.isDirectory();
}

async function folderPresents() {
  fs.stat(dirToMake, function(err) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      return true;
    }
});
  
}

try {
  makeDir();
  copyFiles(__dirname);
} catch (err) {
  console.error(err);
}