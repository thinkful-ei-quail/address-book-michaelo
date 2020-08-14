const app = require('../src/app');
const { expect } = require('chai');
const apiToken = process.env.API_TOKEN;

describe('App', () => {
  describe('GET / endpoints', () => {
    it('GET / responds with 200 containing "Success?"', () => {
      return supertest(app)
        .get('/')
        .auth(apiToken, { type: 'bearer' })
        .expect(200, 'Success?');
    });

    it('GET / responds with 401 containing "Unauthorized request"', () => {
      return supertest(app)
        .get('/')
        .expect(401)
        .expect('Content-Type', /json/)
        .then(res => {
          expect(res.body).to.be.an('object')
            .that.deep.include({ error: 'Unauthorized request' });

        });
    });

    it('GET /address responds with 200 containing array of address objects', () => {
      return supertest(app)
        .get('/address')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
          expect(res.body).to.be.an('array');
        });
    });
  });

  describe('POST/ endpoints', () => {
    it('POST / responds with status 200 containing "POST request received"', () => {
      return supertest(app)
        .post('/')
        .expect(200, 'POST request received');
    });
    it('POST /address with status 201 containing id', () => {
      const testAdd = {
        'firstName': 'Dummy1',
        'lastName': 'DummyOne',
        'address1': 'Dummy Address One',
        'address2': '',
        'city': 'FakeOne',
        'state': 'ND',
        'zip': 10000
      };
      return supertest(app)
        .post('/address')
        .auth(apiToken, { type: 'bearer' })
        .send(testAdd)
        .expect(201)
        .expect('Content-Type', /json/)
        .then(res => {
          expect(res.body).to.have.all.keys('id');
        });
    });
  });

  describe('DELETE/ endpoints', () => {
    it('DELETE /address/:id with status 204 containing "Address deleted"', () => {
      return supertest(app)
        .delete('address')
        .auth(apiToken, { type: 'bearer' })
        .send({ id: '1' })
        .expect(204);
    });
    
    it('DELETE /address/:id with status 404 containing "Address not found"', () => {
      return supertest(app)
        .delete('address')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });
  });
});

