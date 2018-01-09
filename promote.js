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

  const progress = util.progress('\nEvalute promotion', { total: staffs.length })

  let label
  const group = staffs.map(staff => {
    progress.tick()
    const late_rate = 100 * worktime[staff].count_late_hour / worktime[staff].worktime
    const distract_rate = 100 * distraction[staff].count_distract_hour / worktime[staff].worktime
    const estimate_rate = 100 * (estimation[staff].count_estimate_hour - estimation[staff].count_worklog_hour) / estimation[staff].count_estimate_hour
    const bug_rate = 100 * (bug[staff].count_bug) / estimation[staff].count_worklog_hour
    const observation = {
      late_rate, distract_rate, estimate_rate, bug_rate
    }
    label = internals.evalution(observation)
    return _.merge({}, worktime[staff], estimation[staff], distraction[staff], bug[staff], observation, label)
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
    'bug_rate',
  ].concat(Object.keys(label))
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

internals.evalution = (observation) => {

// Rules:
// Điều kiện để promote lên step:
// 1, L < 1%
// 2, D < 0.3
// 3, W > -1

  const promote =
    observation.late_rate < 1
    && observation.distract_rate < 0.3
    && observation.estimate_rate > -1
    && observation.bug_rate < 2.5

  // we can evalute more here
  return {
    promote
  }
}

exports.exec = () => {
  internals.group()
}
