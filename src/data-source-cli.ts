require('ts-node/register');
const { DataSource } = require('typeorm');
const ormconfig = require('../ormconfig.json');

module.exports = new DataSource(ormconfig); 