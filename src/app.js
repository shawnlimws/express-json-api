import 'babel-polyfill'

import data from './data.json'
import express from 'express'
import includes from 'lodash.includes'
import sortBy from 'lodash.sortBy'
import pick from 'lodash.pick'

const app = express()
let participants = data.instructors.concat(data.students)

app.get('/', function (req, res) {
  let response
  if (req.query.name) {
    response = participants.filter(person => {
      return includes(person.name.toLowerCase().split(' '), req.query.name.toLowerCase())
    })
  } else {
    response = participants
  }
  if (req.query.filter) {
    response = response.map(person => pick(person, req.query.filter.split(',')))
  }
  if (req.query.sorted) {
    response = response.sort((a, b) => a.name.localeCompare(b.name))
  }
  if (response.length > 0) {
    res.json(response)
  } else {
    res.status(404)
      .send('Not Found')
  }
})

app.post('/create', function (req, res) {
  const newPerson = {
    name: req.query.name,
    title: req.query.title
  }
  participants.push(newPerson)
  res.status(200).send(newPerson)
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
