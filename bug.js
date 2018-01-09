const moment = require('moment')
const faker = require('faker')
const json2csv = require('json2csv')
const _ = require('lodash')

const util = require('./util')
const staff = require('./staff')
const writeFile = util.writeFile
const storage_path = './storage'

const internals = {}

internals.exportBug = (dayBegin, dayEnd) => {
}

/**
 * Because we may have some missing data, we need transform to what we need
 */
internals.preProcessing = () => {
  // We assume that raw data have no missing value
  const data = require(`${storage_path}/raw/staffs_raw.json`)
  const progress = util.progress('\nProcessing bug data', { total: data.length})

  const result = []
  for (const staff of data) {
    progress.tick()
    const sum = Math.round(Math.random() * 30)
    result.push({
      staff,
      count_bug: sum
    })
  }

  const columns = ['staff', 'count_bug']
  const csv = json2csv({
    data: result,
    fields: columns
  })
  writeFile(`${storage_path}/parsed/staffs_bug_parsed.csv`, csv)
  writeFile(`${storage_path}/parsed/staffs_bug_parsed.json`, JSON.stringify(result))
}

exports.exec = (startDay, endDay) => {

  // We had raw data, don't need export any more
  if (process.env.RE_EXPORT && process.env.RE_EXPORT !== 'false' && process.env.RE_EXPORT !== '0') {
    internals.exportBug(startDay, endDay)
  }

  internals.preProcessing()
}
