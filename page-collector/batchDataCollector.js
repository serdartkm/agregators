const path = require('path');
const ws_domain = 'tr/moda';
const { walkSync } = require('./walkSync');
const fs = require('fs');
const { uploadImage } = require('./uploadImage');
const makeDir = require('make-dir');

async function batchDataCollector({taskSequelizerEventEmitter}) {
  debugger;
const files =[]
  walkSync(`${process.cwd()}/page-collection/${ws_domain}`, async f => {
    files.push(f)
  
  });

for (let filepath of files){

debugger;
  const marka = path.basename(filepath, '.html');

  const { dataCollector } = require(`./${ws_domain}/${marka}/dataCollector`);

  const input = filepath;
  const output = `${process.cwd()}/page-data/${filepath
    .substring(filepath.indexOf(ws_domain))
    .replace('.html', '.json')}`;

  await makeDir(path.dirname(output));
  const page = fs.readFileSync(input, { encoding: 'utf-8' });
  console.log('dataCollection started:', input);
  const data = dataCollector({ page });
  fs.writeFileSync(output, JSON.stringify(data));
   
  //uploadImage(output);
  console.log('dataCollection ended:', output);
  debugger;
}
debugger;
  taskSequelizerEventEmitter.emit('taskComplete', 'page_data_collection')
}

module.exports = {
  batchDataCollector
};



/*
const path = require('path');
const ws_domain = 'tr/moda';
const { walkSync } = require('./walkSync');
const fs = require('fs');
const { uploadImage } = require('./uploadImage');
const makeDir = require('make-dir');

async function batchDataCollector({taskSequelizerEventEmitter}) {

  walkSync(`${process.cwd()}/page-collection/${ws_domain}`, async filepath => {
    const marka = path.basename(filepath, '.html');

    const { dataCollector } = require(`./${ws_domain}/${marka}/dataCollector`);

    const input = filepath;
    const output = `${process.cwd()}/page-data/${filepath
      .substring(filepath.indexOf(ws_domain))
      .replace('.html', '.json')}`;

    await makeDir(path.dirname(output));
    const page = fs.readFileSync(input, { encoding: 'utf-8' });
    console.log('dataCollection started:', input);
    const data = dataCollector({ page });
    fs.writeFileSync(output, JSON.stringify(data));
     
    //uploadImage(output);
    console.log('dataCollection ended:', output);
  });

  taskSequelizerEventEmitter.emit('taskComplete', 'page_data_collection')
}

module.exports = {
  batchDataCollector
};

*/