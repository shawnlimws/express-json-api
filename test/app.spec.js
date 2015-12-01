/* global describe it */
import app from '../src/app.js'
import chai from 'chai'
import request from 'supertest'

const expect = chai.expect
const NOT_FOUND = 404
const OK = 200
const REDIRECT_FOUND = 302

let testPerson = {
  name: 'John Doe ' + Math.random().toString(),
  title: 'Ghost',
  age: Math.floor(Math.random()),
  address: 'Some place in Singapore'
}

describe('/GET method on /participants', function () {
  this.timeout(10000)
  it('should respond with JSON data', done => {
    request(app).get('/participants')
      .expect('Content-Type', /json/)
      .expect(OK)
      .end(done)
  })
  it('should provide a list of participants as an array', done => {
    request(app).get('/participants')
      .expect(res => {
        expect(res.body).to.be.an('array')
      })
      .end(done)
  })
  it('should list names of each participants', done => {
    request(app).get('/participants')
      .expect(res => {
        res.body.every(person => expect(person).to.contain.keys('name'))
      })
      .end(done)
  })
})

describe('/GET /participants?name', function () {
  this.timeout(10000)
  it('should respond with participants whose name is in the URL', done => {
    request(app).get('/participants?name=albert')
      .expect(res => {
        res.body.every(person => {
          expect(person.name.toLowerCase().split(' ')).to.contain('albert')
        })
      })
      .end(done)
  })
  it('should respond with NOT_FOUND if the name is not in the data', done => {
    request(app).get('/participants?name=daslasdf')
      .expect(NOT_FOUND)
      .end(done)
  })
})

describe('/GET /participants?sorted=true', function () {
  this.timeout(10000)
  it('should provide a response sorted by name if sort is true', done => {
    request(app).get('/participants?name=tan&sort=true')
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res).to.satisfy(res => {
          return res.body === res.body.sort((a, b) => a.name.localeCompare(b.name))
        })
      })
      .end(done)
  })
})

describe('/GET /participants?filter=:keys', function () {
  this.timeout(10000)
  it('should provide only whitelisted keys', done => {
    request(app).get('/participants?name=albert&filter=name,imagePath')
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
describe('/POST method on /participants', function () {
  this.timeout(10000)
  const agent = request.agent(app)
  it('should create a new person object and respond with the object', done => {
    agent.post('/participants')
      .send(testPerson)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(res => {
        for (const prop in testPerson) {
          expect(res.body[prop]).to.equal(testPerson[prop])
        }
      })
      .end(done)
  })
  it('should append the new person to the database', done => {
    agent.get('/participants')
      .expect(res => {
        const newPerson = res.body.find(el => el.name === testPerson.name)
        expect(newPerson).to.exist
        for (const prop in testPerson) {
          expect(newPerson[prop]).to.equal(testPerson[prop])
        }
      })
      .end(done)
  })
})

describe('/UPDATE method on /participants', function () {
  this.timeout(10000)
  const agent = request.agent(app)
  testPerson.title = 'A really old guy'
  it('should return OK', done => {
    agent.put('/participants')
      .send(testPerson)
      .expect(OK)
      .end(done)
  })
  testPerson.title = 'A toddler'
  testPerson.age = 1
  it('should return a person with updated properties', done => {
    agent.put('/participants')
      .send(testPerson)
      .expect(res => {
        expect(res.body).to.contain.all.keys(Object.keys(testPerson))
        for (const prop in testPerson) {
          expect(res.body[prop]).to.equal(testPerson[prop])
        }
      })
      .end(done)
  })
  it('should return a complete list of participants with new properties', done => {
    agent.get('/participants')
      .expect(res => {
        const updatePerson = res.body.find(el => el.name === testPerson.name)
        expect(updatePerson).to.exist
        for (const prop in testPerson) {
          expect(updatePerson[prop]).to.equal(testPerson[prop])
        }
      })
      .end(done)
  })
  it('should return NOT FOUND if name is not found', done => {
    agent.put('/participants')
      .send({ name: 'Should not be there' })
      .expect(NOT_FOUND)
      .end(done)
  })
})

describe('/DELETE method on /participants', function () {
  this.timeout(10000)
  const agent = request.agent(app)
  it('should return OK', done => {
    agent.delete('/participants')
      .send({ name: testPerson.name })
      .expect(OK)
      .end(done)
  })
  it('should remove the person from data', done => {
    agent.get('/participants')
      .expect('Content-Type', /json/)
      .expect(OK)
      .expect(res => {
        const names = res.body.map(person => person.name)
        expect(names).to.not.contain(testPerson.name)
      })
      .end(done)
  })
  it('should return NOT FOUND if name is not found', done => {
    agent.delete('/participants')
      .send({ name: 'Should not be there' })
      .expect(NOT_FOUND)
      .end(done)
  })
})

describe('/GET method on /', () => {
  it('should redirect to /participants', done => {
    request(app).get('/')
      .expect(REDIRECT_FOUND)
      .end(done)
  })
})
