import 'babel-polyfill'

import data from './data.json'
import express from 'express'
import queryHandler from 'express-api-queryhandler'
import includes from 'lodash.includes'
import sortBy from 'lodash.sortBy'
import pick from 'lodash.pick'
import fs from 'fs'

const app = express()

// app.use(queryHandler.fields())

app.get('/', function (req, res) {
  res.send(data.students)
  console.log(data)
})

app.get('/:name', function (req, res) {
  const response = data.students.filter(student => {
    return includes(student.name.toLowerCase().split(' '), req.params.name.toLowerCase())
  })
  const sortedResponse = sortBy(response, student => student.name)
  const matchedResponse = sortedResponse.map(student => {
    return req.query.keys ? pick(student, req.query.keys) : student
  })
  res.send(matchedResponse)
})

app.post('/new', function (req, res) {
  console.log(data.students)
  const newStudent = {
    name: req.query.name,
    title: req.query.title
  }
  [data.students].append(newStudent)
  res.send(data.students)
})

app.use(express.static('public'))

var server = app.listen(3000, function () {
  const host = server.address().address
  const port = server.address().port

  console.log('App listening at http://%s:%s', host, port)
})
