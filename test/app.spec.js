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
    request(app).get('/daslasdf')
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
  it('should create a new person object and respond with the object', done => {
    const newPerson = {
      name: 'John Doe',
      title: 'Ghost'
    }
    request(app).post('/create?name=' + newPerson.name + '&title=' + newPerson.title)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(res => {
        expect(res.body).to.deep.equal(newPerson)
      })
      .end(done)
  })
  it('should append the new person the database', done => {
    done()
  })
})

describe('/UPDATE /update?:name&?:properties', () => {
  it('should update a person object with the new properties and return the updated object', done => {
    // const personName = 'Your Name Here'
    // const updateValues = {
    //   title: 'Super Student',
    //   github: 'superstudent'
    // }
    done()
  })
})

describe('/DELETE /delete?:name', () => {
  it('should delete a person object by name', done => {
    done()
  })
})
