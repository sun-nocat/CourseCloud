 /**
* 在字符串后边加一个数据   a,a,s  -> a,a,s,d
*/
const _ = require('lodash')


const stringAdd = function (string, addData) {
   console.log('atringAdd--------------->')
   console.log(string)
   console.log(addData)
   if (string === null || string === '' || string === undefined) {
       return addData
   }
   console.log('stringAdd----------------')
   // 字符串转数组
   const ArrData = string.split(',')
   // 添加新数据
   ArrData.push(addData)
   // 数组去重
   newArrData = _.uniq(ArrData)
   // 去掉空值
   return _.pull(newArrData, '').join() // 过滤空字符串
}


module.exports = { stringAdd }
