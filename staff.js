const json2csv = require('json2csv')
const m = require('moment')
const util = require('./util')

const FORMAT_DATE = util.FORMAT_DATE

const connect = util.connect
const writeFile = util.writeFile
const storage_path = './storage'

exports.exportPlanning = () => {
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
      results = results.sort((a, b) => {
        return a.started_on - b.started_on
      })
      const csv = json2csv({
        data: results,
        fields: columns
      })
      writeFile(`${storage_path}/staffs_planning_raw.csv`, csv)
      writeFile(`${storage_path}/staffs_planning_raw.json`, JSON.stringify(results))
      console.log('Export Planning Staff done', results.length)
    } catch (err) {
      console.log(err)
    }
    connection.destroy()
    console.log();
  })
}

exports.exportTracking = () => {
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
      results = results.sort((a, b) => {
        return a.day - b.day
      })
      const csv = json2csv({
        data: results,
        fields: columns
      })
      writeFile(`${storage_path}/staffs_tracking_raw.csv`, csv)
      writeFile(`${storage_path}/staffs_tracking_raw.json`, JSON.stringify(results))
      console.log('Export Tracking Staff done', results.length)
    } catch (err) {
      console.log(err)
    }
    connection.destroy()
    console.log();
  })
}

exports.parseDataPlanning = () => {
  const data = require(`${storage_path}/staffs_planning_raw.json`)
  let results = []
  data.forEach(row => {
    const result = []
    for (let i = m(row.started_on); i <= m(row.ended_on); i = i.add(1, 'days')) {
      result.push(Object.assign({}, row, {
        day: i.format(FORMAT_DATE),
        count_hour: 8,
      }))
    }
    results = results.concat(result)
  })

  const columns = ['staff', 'project', 'day', 'count_hour']
  try {
    const csv = json2csv({
      data: results,
      fields: columns
    })
    writeFile(`${storage_path}/staffs_planning_parsed.csv`, csv)
    writeFile(`${storage_path}/staffs_planning_parsed.json`, JSON.stringify(results))
    console.log('Export Planning Staff done', results.length)
  } catch (err) {
    console.log(err)
  }
  console.log();
}

exports.parseDataTracking = () => {
  const data = require(`${storage_path}/staffs_tracking_raw.json`)
  let results = data.map(row => {
    row.day = m(row.day).format(FORMAT_DATE)
    row.count_hour = row.end_time - row.start_time
    return row
  })

  const columns = ['staff', 'project', 'day', 'count_hour']
  try {
    const csv = json2csv({
      data: results,
      fields: columns
    })
    writeFile(`${storage_path}/staffs_tracking_parsed.csv`, csv)
    writeFile(`${storage_path}/staffs_tracking_parsed.json`, JSON.stringify(results))
    console.log('Export Tracking Staff done', results.length)
  } catch (err) {
    console.log(err)
  }
  console.log();
}