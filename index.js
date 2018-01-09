require('dotenv').config()

const worktime = require('./worktime')
const estimation = require('./estimation')
const bug = require('./bug')
const distraction = require('./distraction')
const promote = require('./promote')

const startDay = '2016/07/01';
const endDay = '2016/12/31';

// preprocess working time
worktime.exec(startDay, endDay)

// preprocess estimation/reality worklog
estimation.exec(startDay, endDay)

// preprocess bug data
bug.exec(startDay, endDay)

// preprocess distraction data
distraction.exec(startDay, endDay)

promote.exec()