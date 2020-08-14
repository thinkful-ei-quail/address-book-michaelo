require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { v4: uuid } = require('uuid');

const app = express();

const addresses = [{
  'id': '3c8da4d5-1597-46e7-baa1-e402aed70d80',
  'firstName': 'sallyStudent',
  'lastName': 'c00d1ng1sc00l',
  'address1': 'Cache Valley Stone Society',
  'address2': 'false',
  'city': 'Miami',
  'state': 'FL',
  'zip': 33169
},
{
  'id': '6c8da4d5-1597-46e7-baa1-e402aed70d87',
  'firstName': 'cindy',
  'lastName': 'nice',
  'address1': 'Cache Valley Stone Society',
  'address2': 'false',
  'city': 'Austin',
  'state': 'TX',
  'zip': 12345
}];

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ').pop() !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
}

//Endpoint Handlers
//GET Routes
app.get('/', validateBearerToken, (req, res)=> {
  res.send('Success?');
});

app.get('/address', (request, response) => {
  response.json(addresses);
});

//POST Routes
app.post('/', (request, response) => {
  response.send('POST request received');
});

app.post('/address', validateBearerToken, (req, res) => {
  const { firstName, lastName, address1, address2, city, state, zip } = req.body;


  //Validation code here
  //Required fields
  if (!firstName) {
    return res
      .status(400)
      .send('First name required');
  }

  if (!lastName) {
    return res
      .status(400)
      .send('Last name required');
  }

  if (!address1) {
    return res
      .status(400)
      .send('Main address required');
  }

  if (!city) {
    return res
      .status(400)
      .send('City required');
  }

  if (!state) {
    return res
      .status(400)
      .send('State required');
  }

  if (!zip) {
    return res
      .status(400)
      .send('Zip code required');
  }

  //Correct input
  if (state.length !== 2) {
    return res
      .status(400)
      .send('State must be 2 characters');
  }

  if (!zip.toString().match(/^\d{5}(?:[-\s]\d{4})?$/)) {
    return res
      .status(400)
      .send('Zip code must be 5 characters');
  }

  const id = uuid();
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  };

  addresses.push(newAddress);

  res
    .status(201)
    .location(`http://localhost:8000/address/${id}`)
    .json({ id: id });
});

//DELETE Routes
app.delete('/address/:id', validateBearerToken, (req, res) => {
  const { id } = req.params;

  const index = addresses.findIndex(u => u.id === id);

  // make sure we actually find an address with that id
  if (index === -1) {
    return res
      .status(404)
      .send('Address not found');
  }

  addresses.splice(index, 1);

  res
    .send('Address deleted')
    .status(204)
    .end();
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;