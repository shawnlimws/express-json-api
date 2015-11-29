import 'babel-polyfill'

import data from './data.json'
import express from 'express'
import includes from 'lodash.includes'
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
  res.status(200).json(newPerson)
})

// /update/:fullname?property1=value1?proerty2=value2
app.put('/update', function (req, res) {
  const updatePerson = participants.find(el => el.name === req.query.name)
  if(updatePerson) {
    for (const prop in req.query) {
      updatePerson[prop] = !isNaN(req.query[prop]) ? parseInt(req.query[prop], 10) : req.query[prop]
    }
  }
  res.status(200).json(updatePerson)
})

app.delete('/delete', function (req, res) {
  const deletePersonIndex = participants.findIndex(el => el.name === req.query.name)
  participants.splice(deletePersonIndex, 1)
  res.status(200).json(participants)
})

app.use(express.static('public'))

export default app
