'use strict';

require('reflect-metadata');
require('dotenv').config();

const { AppDataSource } = require('../dist/data-source');
const { InitializationService } = require('../dist/services/InitializationService');
const app = require('../dist/app').default;
const serverless = require('serverless-http');

let initPromise = null;

function ensureInit() {
  if (!initPromise) {
    initPromise = AppDataSource.initialize()
      .then(() => InitializationService.initializeDefaultData())
      .catch((err) => {
        initPromise = null;
        throw err;
      });
  }
  return initPromise;
}

const handler = serverless(app, { binary: false });

module.exports = async (req, res) => {
  await ensureInit();
  return handler(req, res);
};
