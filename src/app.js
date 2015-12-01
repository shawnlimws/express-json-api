import 'babel-polyfill'
import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'

const app = express()
const dbUri = 'mongodb://' +
  process.env.EXPRESSAPI_MONGODB_USER + ':' +
  process.env.EXPRESSAPI_MONGODB_PASSWORD +
  '@ds059634.mongolab.com:59634/playground'

mongoose.connect(dbUri)

const Person = mongoose.model('Person', {
  name: String,
  title: String,
  imagePath: String,
  age: Number,
  address: String,
  githubURL: String
})

app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.redirect('/participants')
})

app.get('/participants', function (req, res) {
  const query = req.query.name ? { name: { $regex: req.query.name, $options: 'i' } } : {}
  const projection = req.query.filter ? req.query.filter.replace(/,/g, ' ') : null
  const options = req.query.sort ? { sort: { name: 1 } } : null
  Person.find(query, projection, options, (err, docs) => {
    if (err) return console.err(err)
    if (docs.length > 0) {
      console.log('person found')
      res.json(docs)
    } else {
      console.log('Not Found')
      res.status(404).send('Not Found')
    }
  })
})

// /POST /participants to create new Person
app.post('/participants', function (req, res) {
  const newPerson = new Person(req.body)
  newPerson.save(function (err) {
    if (err) return console.error(err)
    console.log('new person added')
    res.json(newPerson)
  })
})

// /PUT /participants to update Person
app.put('/participants', function (req, res) {
  const updatePerson = req.body
  Person.findOneAndUpdate({name: updatePerson.name}, updatePerson, (err, doc) => {
    if (err) return console.error(err)
    if (doc) {
      console.log('person updated')
      res.json(updatePerson)
    } else {
      res.status(404).send('Not found')
    }
  })
})

// /DELETE /participants to delete Person
app.delete('/participants', function (req, res) {
  const deletePerson = req.body
  Person.findOneAndRemove({name: deletePerson.name}, (err, doc) => {
    if (err) return console.error(err)
    if (doc) {
      console.log('person deleted')
      res.status(200).end()
    } else {
      res.status(404).send('Not Found')
    }
  })
})

export default app
