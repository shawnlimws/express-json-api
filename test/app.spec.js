import app from '../src/app.js'
import includes from 'lodash.includes'
import chai from 'chai'
import request from 'supertest'

const expect = chai.expect
const NOT_FOUND = 404
const OK = 200

describe('/GET /', () => {
  it('should respond with JSON data', done => {
    request(app).get('/')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end(done)
  })
  it('should provide a list of participants as an array', done => {
    request(app).get('/')
      .expect(res => {
        expect(res.body).to.be.an('array')
      })
      .end(done)
  })
  it('should list names of each participants', done => {
    request(app).get('/')
      .expect(res => {
        res.body.every(person => expect(person).to.contain.keys('name'))
      })
      .end(done)
  })
})

describe('/GET /:name', () => {
  it('should respond with participants whose name is in the URL', done => {
    request(app).get('/albert')
      .expect(res => {
        res.body.every(person => {
          expect(person.name.toLowerCase().split(' ')).to.contain('albert')
        })
      })
      .end(done)
  })
  it('should respond with NOT_FOUND if the name is not in the data', done => {
    request(app).get('/daslasdf')
      .expect(NOT_FOUND)
      .end(done)
  })
  it('should provide a response sorted by name', done => {
    request(app).get('/tan')
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res).to.satisfy(res => {
          return res.body === res.body.sort((a, b) => a.name.localeCompare(b.name))
        })
      })
      .end(done)
  })
})

describe('/GET /:name with whitelisted keys', () => {
  it('should provide only whitelisted keys', done => {
    request(app).get('/albert?fields=name,imagePath')
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body.every(person => {
          expect(person).to.have.all.keys(['name', 'imagePath'])
        })
      })
      .end(done)
  })
})

// tests for CRUD
