const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');

async function readDir(pathToDir) {
  const files = await fsPromises.readdir(pathToDir);
  for (const fileName of files) {
    let pathToMyFile = path.join(pathToDir, fileName);
    let fileData = await fileInfo(pathToMyFile);
    
    if (fileData.isDir) {
      let pathToInnerDir = path.join(pathToDir, fileName);
      //await readDir(pathToInnerDir);
    } else {
      let filePathInfo = path.parse(fileName);
      console.log(`${filePathInfo.name} - ${filePathInfo.ext} - ${(fileData.size/1000)}kb`);
    }
  }
}

async function fileInfo(pathToMyFile) {
  const info = await fsPromises.lstat(pathToMyFile);
  let data = {
    'isDir': info.isDirectory(),
    'size': info.size
  }
  return data;
}


try {
  let chkdDir = path.join(__dirname, 'secret-folder');
  readDir(chkdDir);
} catch (err) {
  console.error(err);
}





