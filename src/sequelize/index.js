'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const Sequelize = require('sequelize');

module.exports = config => {
  const db = {};
  db.sequelize = new Sequelize(config.database, config.username, config.password,
    config);
  db.Sequelize = Sequelize;
  fs.readdirSync(path.join(__dirname, 'models'))
    .map(path.parse)
    .filter(file =>
      file.name &&
      file.name.indexOf('.') === -1 &&
      file.name !== 'index' &&
      file.ext === '.js')
    .forEach(file => {
      const model = db.sequelize.import(
        path.join(__dirname, './models', file.base));
      db[model.name] = model;
    });

  return Promise.all(Object.keys(db)
      .filter(modelName => !!db[modelName].setup)
      .map(modelName => db[modelName].setup(db, config)))
    .then(() => {
      return db;
    });
};
