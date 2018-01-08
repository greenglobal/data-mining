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
  const result = []
  for (const staff of data) {
    const sum = Math.round(Math.random() * 120)
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

exports.exec = () => {
  const startDay = '2017/06/01';
  const endDay = '2017/6/15';

  // We had raw data, don't need export any more
  // console.log('\nExport bug raw data')
  // internals.exportBug(startDay, endDay)
  // console.log('Export bug raw data done\n')

  console.log('\nParse bug raw data')
  internals.preProcessing(startDay, endDay)
  console.log('Parse bug raw data done\n')
}