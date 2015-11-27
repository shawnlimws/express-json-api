import 'babel-polyfill'

import data from './data.json'
import express from 'express'
import queryHandler from 'express-api-queryhandler'
import includes from 'lodash.includes'
import sortBy from 'lodash.sortBy'
import pick from 'lodash.pick'

const app = express()
let participants = data.instructors.concat(data.students)

app.use(queryHandler.fields())

app.get('/', function (req, res) {
  res.json(participants)
})

app.get('/:name', function (req, res) {
  const response = participants.filter(student => {
    return includes(student.name.toLowerCase().split(' '), req.params.name.toLowerCase())
  })
  const sortedResponse = response.sort((a, b) => a.name.localeCompare(b.name))
  const matchedResponse = sortedResponse.map(student => {
    return req.fields ? pick(student, req.fields.split(' ')) : student
  })
  if (matchedResponse.length > 0) {
    res.json(matchedResponse)
  } else {
    res.status(404)
      .send('Not Found')
  }

})

app.get('/new', function (req, res) {
  // create form

})
app.post('/create', function (req, res) {
  const newPerson = {
    name: req.query.name,
    title: req.query.title
  }
  participants.push(newPerson)
  res.status(200).send('New person added', newPerson)
})

app.put('/update/:name', function (req, res) {
  const update = {
    name: req.query.name,
    title: req.query.title
  }
})

app.delete('/delete/:name', function (req, res) {

})

app.use(express.static('public'))

export default app
