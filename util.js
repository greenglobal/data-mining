const mysql = require('mysql')
const fs = require('fs')

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
  if (process.env.DEBUG) {
    console.log(`write to ${fileName} done`)
  }
}