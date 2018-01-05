require('dotenv').config()

const staff = require('./staff')

/**
 * fetch from db
 */
staff.exportPlanning()
staff.exportTracking()

/**
 * preprocessing
 */
setTimeout(staff.parseDataPlanning, 5000)
setTimeout(staff.parseDataTracking, 5000)
