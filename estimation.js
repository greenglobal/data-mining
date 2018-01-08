const moment = require('moment')
const faker = require('faker')
const json2csv = require('json2csv')
const _ = require('lodash')
const uuidv4 = require('uuid/v4');

const util = require('./util')
const staff = require('./staff')
const writeFile = util.writeFile
const storage_path = './storage'

const internals = {}

internals.exportEstimation = (dayBegin, dayEnd) => {
  const staffs = require(`${storage_path}/raw/staffs_raw.json`)

  dayBegin = moment(dayBegin, util.FORMAT_DATE)
  dayEnd = moment(dayEnd, util.FORMAT_DATE)
  let result = []
  const time = () => {
    return Math.round(Math.random() * 6 + 1) + Math.round(Math.random())*0.5
  }
  for (let i = dayBegin; i <= dayEnd; i = i.add(1, 'days')) {
    const task = []
    staffs.forEach(staff => {
      task.push({
        staff,
        task: uuidv4(),
        day: i.format(util.FORMAT_DATE),
        estimate_hour: time(),
        worklog_hour: time(),
      })
    })
    result = result.concat(task)
  }
  const columns = ['staff', 'task', 'day', 'estimate_hour', 'worklog_hour']
  const csv = json2csv({
    data: result,
    fields: columns
  })
  writeFile(`${storage_path}/raw/staffs_estimation_raw.csv`, csv)
  writeFile(`${storage_path}/raw/staffs_estimation_raw.json`, JSON.stringify(result))
}

/**
 * Because we may have some missing data, we need transform to what we need
 */
internals.preProcessing = () => {
  // We assume that raw data have no missing value
  const data = require(`${storage_path}/raw/staffs_estimation_raw.json`)
  let group = _.groupBy(data, item => item.staff);
  const result = []
  for (const staff in group) {
    const sumeEstimate = _.sumBy(group[staff], 'estimate_hour');
    const sumWorklog = _.sumBy(group[staff], 'worklog_hour');
    result.push({
      staff,
      count_estimate_hour: sumeEstimate,
      count_worklog_hour: sumWorklog
    })
  }
  const columns = ['staff', 'count_estimate_hour', 'count_worklog_hour']
  const csv = json2csv({
    data: result,
    fields: columns
  })
  writeFile(`${storage_path}/parsed/staffs_estimation_parsed.csv`, csv)
  writeFile(`${storage_path}/parsed/staffs_estimation_parsed.json`, JSON.stringify(result))
}

exports.exec = () => {
  // const startDay = '2017/06/01';
  // const endDay = '2017/6/15';

  // console.log('\nExport estimation raw data')
  // internals.exportEstimation(startDay, endDay)
  // console.log('Export estimation raw data done\n')

  console.log('\nParse estimation raw data')
  internals.preProcessing()
  console.log('Parse estimation raw data done\n')
}