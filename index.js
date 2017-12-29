require('dotenv').config()

const mysql = require('mysql')
const json2csv = require('json2csv')
const fs = require('fs')
const m = require('moment')
const FORMAT_DATE = 'YYYY-MM-DD'

const connect = () => {
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
  console.log(`write to ${fileName} done`)
}

exports.exportPlanningStaff = () => {
  const query = `
  select u.name staff, t.name project, e.started_on,  e.ended_on
  from estimates e, users u, tracking_codes t
  where u.id = e.user_id and e.project_code=t.name and e.deleted_at is null
  union all
  select u.name staff, p.name project, e.started_on,  e.ended_on
  from estimates e, users u, projects p
  where u.id = e.user_id and e.project_code=p.code and e.deleted_at is null
  `
  const columns = ['staff', 'project', 'started_on', 'ended_on']
  const results = []
  const connection = connect()
  connection.query(query, (error, results, fields) => {
    if (error) throw error
    try {
      results = results.sort((a,b) => {
        return a.started_on - b.started_on
      })
      const csv = json2csv({ data: results, fields: columns })
      exports.writeFile('staffs_planning_raw.csv', csv)
      exports.writeFile('staffs_planning_raw.json', JSON.stringify(results))
      console.log('Export Planning Staff done', results.length)
    } catch (err) {
      console.log(err)
    }
    connection.destroy()
    console.log();
  })
}

exports.exportTrackingStaff = () => {
  const query = `
  select u.name staff, t.name project, e.day, e.start_time,  e.end_time
  from project_tracking e, users u, tracking_codes t
  where u.id = e.user_id and e.tracking_code=t.name and e.deleted_at is null
  union all
  select u.name staff, p.name project, e.day, e.start_time,  e.end_time
  from project_tracking e, users u, projects p
  where u.id = e.user_id and e.tracking_code=p.code and e.deleted_at is null
  union all
  select u.name staff, e.tracking_code project, e.day, e.start_time,  e.end_time
  from project_tracking e, users u
  where u.id = e.user_id and tracking_code not in (select code from projects) and tracking_code not in (select name from tracking_codes) and e.deleted_at is null
  `
  const columns = ['staff', 'project', 'day', 'start_time', 'end_time']
  const connection = connect()
  connection.query(query, (error, results, fields) => {
    if (error) throw error
    try {
      results = results.sort((a,b) => {
        return a.day - b.day
      })
      const csv = json2csv({ data: results, fields: columns })
      exports.writeFile('staffs_tracking_raw.csv', csv)
      exports.writeFile('staffs_tracking_raw.json', JSON.stringify(results))
      console.log('Export Tracking Staff done', results.length)
    } catch (err) {
      console.log(err)
    }
    connection.destroy()
    console.log();
  })
}

exports.parseDataPlanning = () => {
  const data = require('./staffs_planning_raw.json')
  let results = []
  data.forEach(row => {
    const result = []
    for (let i = m(row.started_on); i <= m(row.ended_on); i = i.add(1, 'days')) {
      result.push(Object.assign({}, row, {
        day: i.format('YYYY-MM-DD'),
        start_time: 8,
        end_time: 12
      }))
      result.push(Object.assign({}, row, {
        day: i.format('YYYY-MM-DD'),
        start_time: 13,
        end_time: 17
      }))
    }
    results = results.concat(result)
  })

  const columns = ['staff', 'project', 'day', 'start_time', 'end_time']
  try {
    const csv = json2csv({ data: results, fields: columns })
    exports.writeFile('staffs_planning_parsed.csv', csv)
    exports.writeFile('staffs_planning_parsed.json', JSON.stringify(results))
    console.log('Export Planning Staff done', results.length)
  } catch (err) {
    console.log(err)
  }
  console.log();
}

/**
 * fetch from db
 */
exports.exportPlanningStaff()
exports.exportTrackingStaff()

/**
 * preprocessing
 */
setTimeout(exports.parseDataPlanning, 5000)
