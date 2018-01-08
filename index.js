require('dotenv').config()

const staff = require('./staff')
const worktime = require('./worktime')

// preprocess planning/tracking time
staff.exec()

// preprocess working time
worktime.exec()
