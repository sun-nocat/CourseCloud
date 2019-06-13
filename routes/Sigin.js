const { query } = require('../config/db.js')
const { stringAdd } = require('../common/stringAdd.js')
const _ = require('lodash')
const sd  = require('silly-datetime')

class Sigin {


    /**
     * 开始签到  以及  停止签到
     * @param {*} ctx 
     */
    static async submitSigin(ctx) {
        const { user } = ctx.session;
        if (user && user.status === 2) {
            const {  class_id, id } = ctx.request.body
            const { id: teacher_id } = user
            console.log('1')
            // 停止签到  status = 0
            if (id) {
                console.log('2')
                // 根据签到的id进行停止签到
                const dataList = await query(`update \`sigin\` set status = '0' where id = '${id}' `)
                if (dataList.serverStatus === 2) {
                    return ctx.body = {
                        status: true,
                        msg: 'success'
                    }
                }
            }
            // 发布签到  status='1'表示可以进行签到
            console.log('3')
            if (class_id) {
                console.log('start')
                const time = sd.format(new Date(), 'MM-DD HH:mm:ss')


                const datas = await query(`select name from class where id = '${class_id}'`)
                console.log(datas)
                const name = datas[0].name

                const dataList = await query(`insert into \`sigin\`
                 (time, class_id, teacher_id, status) values
                 ('${time}', '${name}', '${teacher_id}', '1') `)
                console.log(dataList)
                if (dataList.serverStatus === 2) {
                    return ctx.body = {
                        status: true,
                        msg: 'success'
                    }
                }
            }

        }
        return ctx.body = {
            status: false,
            msg: 'error'
        }
    }

    /**
     * 查询签到
     * @param {*} ctx 
     */
    static async querySigin(ctx) {
        const { user } = ctx.session

        // 教师  查看自己发布的签到
        if (user && user.status === 2) {
            const { id: teacher_id } = user
            const dataList = await query(`select * from \`sigin\` where teacher_id = '${teacher_id}'`)
            return ctx.body = {
                status: true,
                msg: 'success',
                data: dataList
            }
        }

        // 查询所有可以签到的班级
        if (user && user.status === 1) {
            const dataList = await query(`select * from \`sigin\` where status = '1'`)

            return ctx.body = {
                status: true,
                msg: 'success',
                data: dataList
            }
        }
        return ctx.body = {
            status: false,
            msg: 'error'
        }


    }

    /**
     * 进行签到
     */
    static async doSigin(ctx) {
        const { user } = ctx.session;
        if (user && user.status === 1) {
            const { id } = ctx.request.query
            const { name } = user
            if (id && name) {
                let student_id = await query(`select student_id from \`sigin\` where id = '${id}'`)
                const newStudent_id = _.isEmpty(student_id) ? name : stringAdd(student_id[0].student_id, name)

                const dataList = await query(`update \`sigin\` set student_id = '${newStudent_id}' where id = '${id}' `)
                if (dataList.serverStatus === 2) {
                    return ctx.body = {
                        status: true,
                        msg: 'success'
                    }
                }
            }
        }
        return ctx.body = {
            status: false,
            msg: 'error'
        }

    }

}


module.exports = Sigin