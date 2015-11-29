import app from '../src/app.js'
import includes from 'lodash.includes'
import chai from 'chai'
import request from 'supertest'
import querystring from 'querystring'

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

describe('/GET /?name', () => {
  it('should respond with participants whose name is in the URL', done => {
    request(app).get('/?name=albert')
      .expect(res => {
        res.body.every(person => {
          expect(person.name.toLowerCase().split(' ')).to.contain('albert')
        })
      })
      .end(done)
  })
  it('should respond with NOT_FOUND if the name is not in the data', done => {
    request(app).get('/?name=daslasdf')
      .expect(NOT_FOUND)
      .end(done)
  })
})

describe('/GET /?sorted=true', () => {
  it('should provide a response sorted by name if sorted is true', done => {
    request(app).get('/?name=tan&sorted=true')
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res).to.satisfy(res => {
          return res.body === res.body.sort((a, b) => a.name.localeCompare(b.name))
        })
      })
      .end(done)
  })
})

describe('/GET /?filter=:keys', () => {
  it('should provide only whitelisted keys', done => {
    request(app).get('/?name=albert&filter=name,imagePath')
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
describe('/POST /create?name=:name', () => {
  const agent = request.agent(app)
  const newPerson = {
    name: 'John Doe',
    title: 'Ghost'
  }
  const queryString = querystring.stringify(newPerson)
  it('should create a new person object and respond with the object', done => {
    agent.post('/create?' + queryString)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(res => {
        expect(res.body).to.deep.equal(newPerson)
      })
      .end(done)
  })
  it('should append the new person the database', done => {
    agent.get('/')
      .expect(res => {
        const testPerson = res.body.find(el => el.name === newPerson.name)
        expect(testPerson).to.exist
        for (const prop in newPerson) {
          expect(testPerson[prop]).to.equal(newPerson[prop])
        }
      })
      .end(done)
  })
})

describe('/UPDATE /update?:name&?:properties...', () => {
  const agent = request.agent(app)
  const updatePerson = {
    name: 'Sebastiaan Deckers',
    title: 'Ninja',
    address: 'Keong Saik Road',
    age: 99
  }
  const queryString = querystring.stringify(updatePerson)

  it('should return OK', done => {
    agent.put('/update?' + queryString)
      .expect(OK)
      .end(done)
  })
  it('should return a person with updated properties', done => {
    agent.put('/update?' + queryString)
      .expect(res => {
        expect(res.body).to.contain.all.keys(Object.keys(updatePerson))
        for (const prop in updatePerson) {
          expect(res.body[prop]).to.equal(updatePerson[prop])
        }
      })
      .end(done)
  })
  it('should return a complete list of participants with new properties', done => {
    agent.get('/')
      .expect(res => {
        const testPerson = res.body.find(el => el.name === updatePerson.name)
        expect(testPerson).to.exist
        for (const prop in updatePerson) {
          expect(testPerson[prop]).to.equal(updatePerson[prop])
        }
      })
      .end(done)
  })
})

describe('/DELETE /delete?:name', () => {
  const agent = request.agent(app)
  const deletePerson = {
    name: 'Albert Salim'
  }
  it('should return OK', done => {
    agent.delete('/delete?name=' + deletePerson.name)
      .expect('Content-Type', /json/)
      .expect(OK)
      .end(done)
  })
  it('should remove the person from data', done => {
    agent.get('/')
      .expect('Content-Type', /json/)
      .expect(OK)
      .expect(res => {
        const names = res.body.map(person => person.name)
        expect(names).to.not.contain(deletePerson.name)
      })
      .end(done)
  })
})
