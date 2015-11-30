import 'babel-polyfill'

import data from './data.json'
import express from 'express'
import includes from 'lodash.includes'
import pick from 'lodash.pick'

const app = express()
let participants = data.instructors.concat(data.students)

app.get('/participants', function (req, res) {
  let response
  if (req.query.name) {
    response = participants.filter(person => {
      return person.name.toLowerCase().includes(req.query.name.toLowerCase())
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

// /POST /participants?name=fullname?property1=value1?property2=value2
app.post('/participants', function (req, res) {
  const newPerson = {}
  for (const prop in req.query) {
    newPerson[prop] = !isNaN(req.query[prop]) ? parseInt(req.query[prop], 10) : req.query[prop]
  }
  participants.push(newPerson)
  res.status(200).json(newPerson)
})

// /PUT /participants?name=fullname?property1=value1?property2=value2
app.put('/participants', function (req, res) {
  const updatePerson = participants.find(el => el.name === req.query.name)
  if(updatePerson) {
    for (const prop in req.query) {
      updatePerson[prop] = !isNaN(req.query[prop]) ? parseInt(req.query[prop], 10) : req.query[prop]
    }
    res.status(200).json(updatePerson)
  } else {
    res.status(404).send('NOT FOUND')
  }

})

// /DELETE /participants?name=fullname
app.delete('/participants', function (req, res) {
  const deletePersonIndex = participants.findIndex(el => el.name === req.query.name)
  if(deletePersonIndex >= 0) {
    // delete participants[deletePersonIndex]
    participants.splice(deletePersonIndex, 1)
    res.status(200).json(participants)
  } else {
    res.status(404).send('NOT FOUND')
  }
})

app.use(express.static('public'))

export default app
