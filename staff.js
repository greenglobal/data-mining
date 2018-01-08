const json2csv = require('json2csv')
const m = require('moment')
const util = require('./util')
const _ = require('lodash')

const FORMAT_DATE = util.FORMAT_DATE

const connect = util.connect
const writeFile = util.writeFile
const storage_path = './storage'
const internals = {}

internals.exportPlanning = () => {
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
      writeFile(`${storage_path}/raw/staffs_planning_raw.csv`, csv)
      writeFile(`${storage_path}/raw/staffs_planning_raw.json`, JSON.stringify(results))
    } catch (err) {
      console.log(err)
    }
    connection.destroy()
  })
}

internals.exportTracking = () => {
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
      writeFile(`${storage_path}/raw/staffs_tracking_raw.csv`, csv)
      writeFile(`${storage_path}/raw/staffs_tracking_raw.json`, JSON.stringify(results))
    } catch (err) {
      console.log(err)
    }
    connection.destroy()
    console.log();
  })
}

internals.parseDataPlanning = () => {
  const data = require(`${storage_path}/raw/staffs_planning_raw.json`)
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
    writeFile(`${storage_path}/parsed/staffs_planning_parsed.csv`, csv)
    writeFile(`${storage_path}/parsed/staffs_planning_parsed.json`, JSON.stringify(results))
  } catch (err) {
    console.log(err)
  }
}

internals.parseDataTracking = () => {
  const data = require(`${storage_path}/raw/staffs_tracking_raw.json`)
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
    writeFile(`${storage_path}/parsed/staffs_tracking_parsed.csv`, csv)
    writeFile(`${storage_path}/parsed/staffs_tracking_parsed.json`, JSON.stringify(results))
  } catch (err) {
    console.log(err)
  }
}

exports.getStaffs = () => {
  const data = require(`${storage_path}/raw/staffs_tracking_raw.json`)
  const staff = _.uniq(_.map(data, 'staff'))
  return staff
}

exports.exec = () => {
  // We had raw data, don't need export any more
  // console.log('\nExport Planning Staff done')
  // internals.exportPlanning()
  // console.log('Export Planning Staff done\n')
  // console.log('\nExport Tracking Staff')
  // internals.exportTracking()
  // console.log('Export Tracking Staff done\n')
  // setTimeout(internals.parseDataPlanning, 5000)
  // setTimeout(internals.parseDataTracking, 10000)

  console.log('\nParse Planning Staff')
  internals.parseDataPlanning()
  console.log('Parse Planning Staff done\n')

  console.log('\nParse Tracking Staff')
  internals.parseDataPlanning()
  console.log('Parse Tracking Staff done\n')
}