const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/my_db');

const User = conn.define('user', {
  githubUserId: Sequelize.STRING
});

const sync = ()=> {
  return conn.sync({ force: true });
};

module.exports = {
  models: {
    User
  },
  sync
};
