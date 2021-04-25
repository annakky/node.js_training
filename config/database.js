const { Client } = require('pg');

const client = new Client({
  user: '',
  host: '',
  password: '',
  database: ''
});

module.exports = client;