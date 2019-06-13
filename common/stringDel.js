/**
* 在字符串中删除一个数数据   a,a,s  -> a,a
*/
const _ = require('lodash')

const stringDel = function (string, delData) {
    console.log('stringDel-------->')
    if (string === null || string === '' || string === undefined) {
        return delData
    }
    const ArrData = string.split(',')
    const newArrData = _.pull(ArrData, '')
    return _.pull(newArrData, String(delData)).join()
}

module.exports = { stringDel }
