const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const process = require('process');


const dirToMake = path.join(__dirname, 'project-dist');


async function makeDir() {
  let isFolder = await dirPresents(path.join(__dirname, 'project-dist'));
  
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

async function wrapper() {
  const htmlFileStr = await readTemplate();
  const tags = await getTags();
  
  
  const promises = tags.map(tag => {
    return new Promise((resolve, reject) => {
      
      resolve ({'name': tag.name, 'data': readFile(path.join(__dirname, 'components', (tag.name + '.html'))).then((val) => {
        //console.log(val)
        return val;
      }) //await
    })
      
      // //console.log(fileData.then())
      // tag.data = fileData.then((val) => {
      //   return val;
      // });
      
      // resolve(tag);
    });
  });

  Promise.all(promises).then(function(values){     
      for (let i = 0; i < values.length; i++) {
        // tagName = `{{${values[i]}}}`;
        // console.log(values[i])
        let data = values[i].data.then();
        htmlFileStr = htmlFileStr.replace(values[i].name, data);
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
      resolve(fileAsStr);
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


/////////////////////
// async function wrapper2() {
//   await readTemplate();
// }

try {
  makeDir();
  //htmlFileStr = readTemplate().then(val => val);
  //wrapper2();
  //readTemplate();
  
  wrapper();

} catch (err) {
  console.error(err);
}