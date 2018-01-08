require('dotenv').config()

const staff = require('./staff')
const worktime = require('./worktime')
const estimation = require('./estimation')
const bug = require('./bug')

// preprocess planning/tracking time
staff.exec()

// preprocess working time
worktime.exec()

// preprocess estimation/reality worklog
estimation.exec()

// preprocess bug data
bug.exec()