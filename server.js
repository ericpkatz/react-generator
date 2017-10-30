const express = require('express');
const path = require('path');
const jwt = require('jwt-simple');
const models = require('./db').models; 

const app = express();

app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/css', express.static(path.join(__dirname, 'css')));

//if running locally you can have a file with your 'secrets'
//if you are deployed- set environmental variables
var config = process.env; 
if(process.env.NODE_ENV === 'development'){
  config = require('./config.json');
  Object.assign(process.env, config);
}

const JWT_SECRET = process.env.JWT_SECRET || 'foo';

const oauthProviderMap = require('./oauth')(app, config, JWT_SECRET);

app.get('/api/session/:token', (req, res, next)=> {
  if(!req.params.token){
    return res.sendStatus(401);
  }
  let userId;
  try{
    userId = jwt.decode(req.params.token, JWT_SECRET).id; 
  }
  catch(er){
    console.log(er);
    return res.sendStatus(401);
  }
  const config = {
    attributes: {
      exclude: ['githubAccessToken' ]
    }
  };

  models.User.findById(userId, config)
    .then( user => {
      res.send(user);
    });
});

app.get('/', (req, res, next)=> {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if(process.env.SEED){
  console.log('sync');
  require('./db').sync();
}

app.listen(process.env.PORT || 3000);



