const moment = require('moment')
const faker = require('faker')
const json2csv = require('json2csv')
const _ = require('lodash')

const util = require('./util')
const staff = require('./staff')
const writeFile = util.writeFile
const storage_path = './storage'

const internals = {}

internals.exportWorktime = (dayBegin, dayEnd) => {
  // save staffs to storage
  // const staffs = staff.getStaffs()
  // writeFile(`${storage_path}/staffs_raw.json`, JSON.stringify(staffs))
  // writeFile(`${storage_path}/staffs_raw.csv`, json2csv({data: staffs.map(staff => {return {staff}}), fields: ['staff']}))

  const staffs = require(`${storage_path}/raw/staffs_raw.json`)

  dayBegin = moment(dayBegin, util.FORMAT_DATE)
  dayEnd = moment(dayEnd, util.FORMAT_DATE)
  let result = []
  for (let i = dayBegin; i <= dayEnd; i = i.add(1, 'days')) {
    const trackingDay = []
    staffs.forEach(staff => {
      const rate = 100 - (Math.random() * 15)
      trackingDay.push({
        staff,
        day: i.format(util.FORMAT_DATE),
        rate: parseFloat(((rate < 95 ? rate: 100)/100).toFixed(2))
      })
    })
    result = result.concat(trackingDay)
  }
  const columns = ['staff', 'day', 'rate']
  const csv = json2csv({
    data: result,
    fields: columns
  })
  writeFile(`${storage_path}/raw/staffs_worktime_raw.csv`, csv)
  writeFile(`${storage_path}/raw/staffs_worktime_raw.json`, JSON.stringify(result))
}

/**
 * Because we may have some missing data, we need transform to what we need
 */
internals.preProcessing = () => {
  // We assume that raw data have no missing value
  const data = require(`${storage_path}/raw/staffs_worktime_raw.json`)
  let group = _.groupBy(data, item => item.staff);
  const result = []
  for (const staff in group) {
    const sumRate = _.sumBy(group[staff], item => { return 1 - item.rate});
    result.push({
      staff,
      count_late_hour: parseFloat(sumRate.toFixed(2)) * 8
    })
  }
  const columns = ['staff', 'count_late_hour']
  const csv = json2csv({
    data: result,
    fields: columns
  })
  writeFile(`${storage_path}/parsed/staffs_worktime_parsed.csv`, csv)
  writeFile(`${storage_path}/parsed/staffs_worktime_parsed.json`, JSON.stringify(result))
}

exports.exec = () => {
  const startDay = '2017/06/01';
  const endDay = '2017/6/15';

  // We had raw data, don't need export any more
  // console.log('\nExport working time raw data')
  // internals.exportWorktime(startDay, endDay)
  // console.log('Export working time raw data done\n')

  console.log('\nParse working time raw data')
  internals.preProcessing(startDay, endDay)
  console.log('Parse working time raw data done\n')
}