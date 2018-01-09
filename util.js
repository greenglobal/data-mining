const mysql = require('mysql')
const fs = require('fs')
const ProgressBar = require('progress')

exports.FORMAT_DATE = 'YYYY-MM-DD'

exports.connect = () => {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    port : process.env.DB_PORT
  })
}

exports.writeFile = (fileName, data) => {
  fs.writeFileSync(fileName, data)
  if (process.env.DEBUG && process.env.DEBUG !== 'false' && process.env.DEBUG !== '0') {
    console.log(`write to ${fileName} done`)
  }
}

exports.isWeekend = (date) => {
  const d = new Date(date)
  return d.getDay() === 6 || d.getDay() === 0
}

exports.progress = (task, options) => {
  return new ProgressBar(`${task} [:bar] :percent`, options)
}
