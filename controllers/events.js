// require('dotenv').config();
// const app = require('../app.js');
const { Router, request } = require('express');


module.exports = Router()
  .post('/', async(req, res, next) => {
      console.log('post route!', req)
  })

  .get('/', async(req, res, next) => {
    console.log('get route!', req)
  })

  .post('/', async(req, res, next) => {
    
  })