const json2csv = require('json2csv')
const util = require('./util')
const _ = require('lodash')

const FORMAT_DATE = util.FORMAT_DATE

const writeFile = util.writeFile
const storage_path = './storage'
const internals = {}

internals.group = () => {
  const staffs = require(`${storage_path}/raw/staffs_raw.json`).sort()
  let worktime = _.sortBy(require(`${storage_path}/parsed/staffs_worktime_parsed.json`), ['staff'])
  let estimation = _.sortBy(require(`${storage_path}/parsed/staffs_estimation_parsed.json`), ['staff'])
  let distraction = _.sortBy(require(`${storage_path}/parsed/staffs_distraction_parsed.json`), ['staff'])
  let bug = _.sortBy(require(`${storage_path}/parsed/staffs_bug_parsed.json`), ['staff'])

  worktime = _.zipObject(worktime.map(i => i.staff), worktime);
  estimation = _.zipObject(estimation.map(i => i.staff), estimation);
  distraction = _.zipObject(distraction.map(i => i.staff), distraction);
  bug = _.zipObject(bug.map(i => i.staff), bug);

  const group = staffs.map(staff => {
    const late_rate = 100 * worktime[staff].count_late_hour / worktime[staff].worktime
    const distract_rate = 100 * distraction[staff].count_distract_hour / worktime[staff].worktime
    const estimate_rate = 100 * (estimation[staff].count_estimate_hour - estimation[staff].count_worklog_hour) / estimation[staff].count_estimate_hour

    return _.merge({}, worktime[staff], estimation[staff], distraction[staff], bug[staff], {
      late_rate, distract_rate, estimate_rate
    })
  })

  const columns = [
    'staff',
    'worktime',
    'count_late_hour',
    'count_estimate_hour',
    'count_worklog_hour',
    'count_distract_hour',
    'count_bug',
    'late_rate',
    'distract_rate',
    'estimate_rate',
  ]
  try {
    const csv = json2csv({
      data: group,
      fields: columns
    })
    writeFile(`${storage_path}/parsed/staffs_promote.csv`, csv)
    writeFile(`${storage_path}/parsed/staffs_promote.json`, JSON.stringify(group))
  } catch (err) {
    console.log(err)
  }
}

exports.exec = () => {
  console.log('\nProcess preparation data')
  internals.group()
  console.log('Process preparation data done\n')
}