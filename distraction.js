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

internals.exportDistraction = (dayBegin, dayEnd) => {
  const staffs = require(`${storage_path}/raw/staffs_raw.json`)

  dayBegin = moment(dayBegin, util.FORMAT_DATE)
  dayEnd = moment(dayEnd, util.FORMAT_DATE)
  let result = []
  for (let i = dayBegin; i <= dayEnd; i = i.add(1, 'days')) {
    // ignore for weekend
    if (util.isWeekend(i)) {
      continue
    }
    const task = []
    staffs.forEach(staff => {
      task.push({
        staff,
        site: ['facebook', 'youtube'][Math.round(Math.random())],
        count_distract_hour: [0, 0, parseFloat((Math.random()/4).toFixed(2))][Math.round(Math.random() * 2)],
      })
    })
    result = result.concat(task)
  }
  const columns = ['staff', 'site', 'count_distract_hour']
  const csv = json2csv({
    data: result,
    fields: columns
  })
  writeFile(`${storage_path}/raw/staffs_distraction_raw.csv`, csv)
  writeFile(`${storage_path}/raw/staffs_distraction_raw.json`, JSON.stringify(result))
}

/**
 * Because we may have some missing data, we need transform to what we need
 */
internals.preProcessing = () => {
  // We assume that raw data have no missing value
  const data = require(`${storage_path}/raw/staffs_distraction_raw.json`)
  let group = _.groupBy(data, item => item.staff);
  const result = []
  for (const staff in group) {
    const sum = parseFloat(_.sumBy(group[staff], 'count_distract_hour').toFixed(2))
    result.push({
      staff,
      count_distract_hour: sum,
    })
  }
  const columns = ['staff', 'count_distract_hour']
  const csv = json2csv({
    data: result,
    fields: columns
  })
  writeFile(`${storage_path}/parsed/staffs_distraction_parsed.csv`, csv)
  writeFile(`${storage_path}/parsed/staffs_distraction_parsed.json`, JSON.stringify(result))
}

exports.exec = (startDay, endDay) => {
  // console.log('\nExport distraction raw data')
  // internals.exportDistraction(startDay, endDay)
  // console.log('Export distraction raw data done\n')

  console.log('\nParse distraction raw data')
  internals.preProcessing()
  console.log('Parse distraction raw data done\n')
}