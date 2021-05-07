const fs = require('fs');
const request = require('request');
const { walkSync } = require('./walkSync');
const { removeDerectory } = require('./removeDerectory');
const path = require('path');
const nodeUrl = require('url');
const makeDir = require('make-dir');
const puppeteer = require('puppeteer');
const { uuidv4 } = require('./uuidv4');

const Jimp = require('jimp');
const { promiseConcurrency } = require('./promiseConcurrency');
const { imageSizeOptimizer } = require('./image-processes/imageSizeOptimizer');
const { workerService } = require('./workerService');

const ws_domain = 'tr/moda';
async function batchPageCollector() {
  const concurrency = promiseConcurrency({
    batchConcurrency: 2,
    totalConcurrency: 10
  });

  const browser = await puppeteer.launch({ headless: false, timeout: 0 });
  walkSync(
    `${process.cwd()}/page-collector/${ws_domain}/page-urls`,
    async filepath => {
      const pagePath = filepath
        .substring(filepath.indexOf('page-urls') + 9)
        .replace('.js', '');

      const sourcePages = require(filepath);
      sourcePages.forEach(url => {
        const marka = nodeUrl
          .parse(url, true)
          .hostname.replace('www.', '')
          .replace('.com.tr', '')
          .replace('.com', '');

        const {
          pageCounter
        } = require(`./${ws_domain}/${marka}/pageCounter.js`);

        const { pageCollector } = require('./pageCollector');

        const output = `${process.cwd()}/page-collection/${ws_domain}/${pagePath}/${marka}.html`;

        concurrency({
          batchName: marka,
          promise: pageCollector({ url, output, pageCounter, browser })
        });
        console.log(
          'filepath',
          filepath.substring(filepath.indexOf('page-urls') + 9)
        );
      });
    }
  );
}

function batchDataCollector() {
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
    console.log('dataCollection ended:', output);
  });
}
function download(url, dest) {
  /* Create an empty file where we can save data */
  const file = fs.createWriteStream(dest);
  return () => {
    /* Using Promises so that we can use the ASYNC AWAIT syntax */
    return new Promise((resolve, reject) => {
      request({
        /* Here you should specify the exact link to the file you are trying to download */
        uri: url,
        gzip: true
      })
        .pipe(file)
        .on('finish', async () => {
          console.log(`The file is finished downloading.`);
          resolve();
        })
        .on('error', error => {
          reject(error);
        });
    });
  };
}
function batchImageCollection() {
  const concurrency = promiseConcurrency({
    batchConcurrency: 2,
    totalConcurrency: 10
  });
  walkSync(`${process.cwd()}/page-data/${ws_domain}`, async filepath => {
    try {
      const batchName = path.basename(filepath, '.json');

      const data = fs.readFileSync(filepath, { encoding: 'utf-8' });
      const output =
        path.dirname(
          `${process.cwd()}/page-image/${filepath.substring(
            filepath.indexOf(ws_domain)
          )}`
        ) + '/img/original';

      await makeDir(output);
      const dataObject = JSON.parse(data);
      for (let d of dataObject) {
        const { image: { optsrc } } = d;
        if (optsrc) {
          const filename = path.basename(optsrc);
          const fileEndPath = `${output}/${filename}`;
          concurrency({
            batchName,
            promise: download(optsrc, fileEndPath)
          });
        }
      }
    } catch (error) {}
  });
}

async function batchImageCropping(size) {
  let queque = [];
  const batch = 100;
  console.log('start....');
  walkSync(`${process.cwd()}/page-image/${ws_domain}`, async function(
    filepath
  ) {
    if (!filepath.includes('.DS_Store')) {
      queque.push(filepath);
    }
  });
  let i;
  let promises = [];
  for (i = 0; i <= queque.length; i += batch) {
    const nextSlice = queque.slice(i, i + batch);
    promises.push(await workerService({ workerData: { nextSlice, index: i } }));
  }
  await Promise.all(promises);
  console.log('queque', queque.length);
  debugger;
  console.log('end....');
}

function batchImageSizeOptimizer() {
  debugger;
  walkSync(`${process.cwd()}/page-data/${ws_domain}`, filepath => {
    if (!filepath.includes('.DS_Store')) {
      const input = filepath;

      const dirname = path.dirname(filepath);

      const imgOutput = dirname.substring(dirname.indexOf(ws_domain)) + '/img/';

      console.log('imageOptimization started:', input);

      imageSizeOptimizer({ input, imgOutput });
    }
  });
}

function batchMetaCreation() {}

const env = process.env.NODE_ENV;

env === 'page_collection' &&
  removeDerectory('page-collection') & batchPageCollector();
env === 'page_data_collection' &&
  removeDerectory('page-data') & batchDataCollector();

env === 'page_image_collection' &&
  removeDerectory('page-image') & batchImageCollection();

env === 'page_image_crop' && batchImageCropping(288);

env === 'page_image_optimization' &&
  walkSync(`${process.cwd()}/page-data/${ws_domain}`, async filepath => {
    if (!filepath.includes('.DS_Store')) {
      if (filepath.includes('.image-optimized-1.json')) {
        fs.rmSync(filepath);
      }
    }
  }) & batchImageSizeOptimizer();

env === 'page_meta_creation' && batchMetaCreation();
