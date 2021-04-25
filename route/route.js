const database = require('../config/database')
const stats = require('./stats')
const tables = require('./tables')

module.exports.route = (app) => {

  app.get('/api/stats/patients', stats.patients);
  app.get('/api/stats/visits', stats.visits);

  app.get('/api/tables/:table_name', tables.all);
  app.get('/api/tables/:table_name/:column', tables.column);
}
