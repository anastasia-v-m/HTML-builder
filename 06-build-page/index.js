const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const process = require('process');


const dirToMake = path.join(__dirname, 'project-dist');
const styleFile = path.join(__dirname, 'project-dist', 'style.css');
const styledDir = path.join(__dirname, 'styles');

let toDel = [];

async function removeInDir(dirToRemove) {

  fs.readdir(dirToRemove, async (err, files) => {
    if (err) throw err;
    for (const file of files) {
      let fileData = await fileInfo(path.join(dirToRemove, file));
      if (!fileData.isDirectory()) {
        await fsPromises.unlink(path.join(dirToRemove, file));
      } else {
        toDel.push(path.join(dirToRemove, file));
        await removeInDir(path.join(dirToRemove, file));
        //console.log('2', path.join(dirToRemove, file))
        //await fsPromises.rmdir(dirToRemove);
      }
    }
    //await fsPromises.rmdir(dirToRemove);
  });
}

async function removeDir() {
  
}

async function makeDir() {
  let isFolder = await dirPresents(path.join(__dirname, 'project-dist'));
  
  if (isFolder) {
    toDel.push(dirToMake);
    await removeInDir(dirToMake);
    await removeDir();
  } else {
    fsPromises.mkdir(dirToMake);
  }
}

async function findOrMakeDir(adr) {
  let isFolder = await dirPresents(adr);
  
  if (!isFolder)  {
    fsPromises.mkdir(dirToMake);
  }
}

async function readTemplate() {

  let htmlTemplate = '';
  let pathToMyFile = path.join(__dirname, 'template.html');
  htmlTemplate = await toStr(pathToMyFile).then(val => val);
  

  return new Promise(
    (resolve, reject) => {
      resolve(htmlTemplate);
    }
  ); 
  
  // return htmlTemplate;
}

async function fileInfo(pathToMyFile) {
  const info = await fsPromises.lstat(pathToMyFile);
  return info;
}

async function dirPresents(myDir) {
  try {
    const isDir = await fsPromises.lstat(myDir); 
    return true;
  } catch (error) {
    return false;
  }
}


async function getTags() {
  let tags = [];
  const files = await fsPromises.readdir(path.join(__dirname, 'components'));
  for (const fileName of files) {
    let pathToMyFile = path.join(__dirname, 'components', fileName);
    let fileData = await fileInfo(pathToMyFile);
    if (!fileData.isDirectory()) {
      let obj = {};
      let name = path.parse(fileName).name;
      obj.name = name;
      tags.push(obj);
    }
  }
  
  return new Promise(
    (resolve, reject) => {
      resolve(tags);
    }
  );   
}


async function addData(tag) {
  let dat = '';
  dat = await readFile(path.join(__dirname, 'components', (tag.name + '.html')), tag.name);  
  
  return new Promise(
    (resolve, reject) => {
      resolve(dat);
    }
  ); 
}

async function wrapper() {
  let htmlFileStr = await readTemplate();
  const tags = await getTags();
  //console.log(htmlFileStr);
  
  const promises = tags.map((tag) => {
    return new Promise((resolve, reject) => {
      resolve(addData(tag));
    });
    //await addData(tag);
  });

  Promise.all(promises).then(function(values){     
      for (let i = 0; i < values.length; i++) {
        let data = values[i];
        let position = data.indexOf('{{');
        let tagInBrackets = data.substring(position);
        let clearData = data.substring(0, position);
        htmlFileStr = htmlFileStr.replace(tagInBrackets, clearData);
      }
      let outputFile = path.join(__dirname, 'project-dist', 'index.html');
      let out_Stream = fs.createWriteStream(outputFile);
      out_Stream.write(htmlFileStr);
  });
  
  
      
}

async function readFile(pathToFile, tag) {
  let fileAsStr = '';
  fileAsStr = await toStr(pathToFile);
  
  return new Promise(
    (resolve, reject) => {
      resolve('' + fileAsStr + '{{' + tag + '}}');
    }
  ); 
}

async function toStr(pathToFile) {
  return new Promise(
    (resolve, reject) => {
      let str = '';
      let in_Stream = fs.createReadStream(pathToFile).setEncoding('utf8');
      in_Stream.on('data', (chunk) => {
        str = chunk.toString();
        resolve(str);
      }); 
    }
  );
}


////////////////////////////////////////styles////////////////////////////////////
async function prepareOutput(file) {
  let isFile = await dirPresents(file);  
  if (isFile) {
    try 
      {await delFile(file); }
    catch 
      {console.log('')}
  }
}

async function delFile(file) {
  fs.unlink(file
    //, err => {
    //if (err) throw err;
  //}
  );  
}

async function styleWrapper(pathToDir) {
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
      let outputFile = path.join(__dirname, 'project-dist', 'style.css');
      let out_Stream = fs.createWriteStream(outputFile);
      for (let i = 0; i < values.length; i++) {
        out_Stream.write(values[i]);
      }
  });
}

async function readDir2(pathToFile) {
  let styles = '';
  styles = await toArr2(pathToFile);
  
  return new Promise(
    (resolve, reject) => {
      resolve(styles);
    }
  ); 
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
    }
  );
}

////////////////////////////////////////copy////////////////////////////////////
async function copyFiles(initFolder, distFolder) {
  const files = await fsPromises.readdir(initFolder);
  for (const fileName of files) {
    let pathToMyFile = path.join(initFolder, fileName);
    let isDir = await fileInfo(pathToMyFile);
    
    if (!isDir.isDirectory()) {
      let fileFrom = path.join(initFolder, fileName);
      let fileTo = path.join(distFolder, fileName);
      await fsPromises.copyFile(fileFrom, fileTo);
    } else {
      await findOrMakeDir(pathToMyFile);
      await copyFiles(path.join(initFolder, fileName), path.join(distFolder, fileName));
    }
  }
}




try {

  makeDir();  
  wrapper();

  //prepareOutput(styleFile);
  styleWrapper(styledDir);

  // fs.mkdir(path.join(dirToMake, 'assets'), { recursive: false }, (err) => {
  //   if (err) throw err;
  // });
   copyFiles(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));


} catch (err1) {
  console.error(err1);
}