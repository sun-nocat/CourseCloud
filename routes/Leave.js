/*
请假模块
 * @Author: sunmingming 
 * @Date: 2019-06-08 17:18:55 
 * @Last Modified by: sunmingming
 * @Last Modified time: 2019-06-08 17:46:21
 */

const { query } = require('../config/db.js')
const _ = require('lodash')


class Leave {

    /**
     * 提交请假单
     * @param {*} ctx 
     */
    static async submitLeave(ctx) {
        const { user } = ctx.session
        // 学生
        if (user && user.status === 1) {
            const { begin_time, end_time, class_id, teacher_id } = ctx.request.body
            const msg = '事假'
            const { id,name } = user
            if (begin_time && end_time && msg && class_id && teacher_id) {

                const dataList  = await query(`insert into \`leave\` 
                (begin_time, end_time, msg, class_id, teacher_id, student_id,name) values 
                ('${begin_time}', '${end_time}', '${msg}', '${class_id}', '${teacher_id}', '${id}', '${name}')`)
                if (dataList.serverStatus === 2) {
                    return ctx.body = {
                        status: true,
                        msg: 'success'
                    }
                }
            }
        }
        return ctx.body = {
            status: true,
            msg: 'success'
        }
    }

    /**
     * 查询请假记录
     */
    static async queryLeave(ctx) {
        const { user } = ctx.session

        // 学生
        if (user && user.status === 1) {
            const { id } = user
            // 获取自己的请假单
            const dataList = await query(`select * from \`leave\` where student_id = ${id}`)
            return ctx.body = {
                status: true,
                msg: 'success',
                data: dataList
            }
        }

        // 老师
        if (user && user.status === 2) {
            const { id } = user
            // 获取自己学生的所有请假单
            const dataList = await query(`select * from \`leave\` where teacher_id = ${id}`)
            return ctx.body = {
                status: true,
                msg: 'success',
                data: dataList
            }

        }

        return ctx.body = {
            status: false,
            msg: 'errror',
        }
    }

    /**
     * 处理请假
     * @param {*} ctx 
     */
    static async dealLeave(ctx) {
        const { user } = ctx.session
        if (user && user.status === 2) {
            const { agree, agree_msg, id } = ctx.request.body

            const dataList = await query(`update \`leave\` set 
            agree = '${agree}', agree_msg = '${agree_msg}' where id = '${id}' `)

            if (dataList.serverStatus === 2) {
                return ctx.body = {
                    status: true,
                    msg:'success'
                }
            }
        }

        return ctx.body = {
            status: false,
            msg: 'errror',
        }
        
    }
}

module.exports = Leave