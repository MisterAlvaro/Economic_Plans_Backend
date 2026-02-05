'use strict';

const path = require('path');

require('reflect-metadata');
require('dotenv').config();

const distDir = path.join(process.cwd(), 'dist');
const { AppDataSource } = require(path.join(distDir, 'data-source'));
const { InitializationService } = require(path.join(distDir, 'services', 'InitializationService'));
const app = require(path.join(distDir, 'app')).default;
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
