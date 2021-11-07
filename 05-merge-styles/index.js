const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const process = require('process');



async function wrapper(pathToDir) {
const files = [];
const files_ = await fsPromises.readdir(pathToDir);
for (const fileName of files_) {
  let pathToMyFile = path.join(pathToDir, fileName);
  let fileData = await fileInfo(pathToMyFile);
  if (!fileData.isDirectory()) {
    let fileExt = path.parse(fileName).ext;
    if (fileExt === '.css') {
      files.push(fileName);
    }
  }
}

const promises = files.map(file => {
  return new Promise((resolve, reject) => {

    resolve(readDir2(path.join(pathToDir, file)));
  
  
  });
});

Promise.all(promises).then(function(values){
    let outputFile = path.join(__dirname, 'project-dist', 'bundle.css');
    let out_Stream = fs.createWriteStream(outputFile);
    console.log(values)
    for (let i = 0; i < values.length; i++) {
      out_Stream.write(values[i]);
    }
});
}




async function readDir2(pathToFile, fileName) {

  let styles = '';
  
  
    // let pathToMyFile = path.join(pathToDir, fileName);
    // let fileData = await fileInfo(pathToMyFile);
    // if (!fileData.isDirectory()) {
    //   let fileExt = path.parse(fileName).ext;
    //   if (fileExt === '.css') {
        styles = await toArr2(pathToFile);
        
    //   }
    // }
  
  
  return new Promise(
    (resolve, reject) => {
      resolve(styles);
    }
  ); 

}

async function readDir(pathToDir) {

  let styles = [];
  const files = await fsPromises.readdir(pathToDir);
  for (const fileName of files) {
    let pathToMyFile = path.join(pathToDir, fileName);
    let fileData = await fileInfo(pathToMyFile);
    if (!fileData.isDirectory()) {
      let fileExt = path.parse(fileName).ext;
      if (fileExt === '.css') {
        await toArr(pathToMyFile, styles);
      }
    }
  }
  
  return new Promise(
    (resolve, reject) => {
      resolve(styles);
    }
  ); 

}


async function fileInfo(pathToMyFile) {
  const info = await fsPromises.lstat(pathToMyFile);
  return info;
}

async function toArr(pathToCSS, arr) {
  let in_Stream = fs.createReadStream(pathToCSS).setEncoding('utf8');
  in_Stream.on('data', (chunk) => {
    let str = chunk.toString();
    arr.push(str);
  });  
}

async function toArr2(pathToCSS) {
   

  return new Promise(
    (resolve, reject) => {


      let str = '';
      let in_Stream = fs.createReadStream(pathToCSS).setEncoding('utf8');
      in_Stream.on('data', (chunk) => {
        str = chunk.toString();
        resolve(str);
      }); 


      // resolve(str);
    }
  );
}

async function toBandle(arr) {
  let outputFile = path.join(__dirname, 'project-dist', 'bundle.css');
  let out_Stream = fs.createWriteStream(outputFile);
  
  for (let i = 0; i < arr.length; i++) {
    out_Stream.write(arr[i]);
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
  let styledDir = path.join(__dirname, 'styles');



  wrapper(styledDir);

  
  // readDir(styledDir).then(
  //   function (arr) {
    
  //     let outputFile = path.join(__dirname, 'project-dist', 'bundle.css');
  //     let out_Stream = fs.createWriteStream(outputFile);
      
  //     for (let i = 0; i < arr.length; i++) {
  //       out_Stream.write(arr[i]);
  //     }

  //   }
  // );

} catch (err) {
  console.error(err);
}