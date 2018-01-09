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
  const progress = util.progress('Export worktime raw', { total: dayEnd.diff(dayBegin, 'day')})

  let result = []
  for (let i = dayBegin; i <= dayEnd; i = i.add(1, 'days')) {
    progress.tick()
    // ignore for weekend
    if (util.isWeekend(i)) {
      continue
    }
    const trackingDay = []
    staffs.forEach(staff => {
      const rate = (100 - Math.round(Math.random() * 12))/100
      trackingDay.push({
        staff,
        day: i.format(util.FORMAT_DATE),
        rate: [1, 1, rate][Math.round(Math.random() * 2)],
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
  const progress = util.progress('Processing worktime', { total: Object.keys(group).length })

  const result = []
  for (const staff in group) {
    progress.tick();
    const vacation = [5, 8, 10][Math.round(Math.random()*2)]
    const sumRate = _.sumBy(group[staff], item => { return 1 - (item.rate > 0.9 ? 1 : item.rate)})
    const sumWork = group[staff].length - vacation
    result.push({
      staff,
      worktime: sumWork * 8,
      count_late_hour: parseFloat(sumRate.toFixed(2)) * 8
    })
  }
  const columns = ['staff', 'worktime', 'count_late_hour']
  const csv = json2csv({
    data: result,
    fields: columns
  })
  writeFile(`${storage_path}/parsed/staffs_worktime_parsed.csv`, csv)
  writeFile(`${storage_path}/parsed/staffs_worktime_parsed.json`, JSON.stringify(result))
}

exports.exec = (startDay, endDay) => {
    // We had raw data, don't need export any more
  if (process.env.RE_EXPORT && process.env.RE_EXPORT !== 'false' && process.env.RE_EXPORT !== '0') {
    internals.exportWorktime(startDay, endDay)
  }
  internals.preProcessing()
}
