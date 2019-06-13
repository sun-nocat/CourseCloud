const { query } = require('../config/db.js')
const { stringAdd } = require('../common/stringAdd.js')
const sd  = require('silly-datetime')
const _ = require('lodash')


class Char {

    /**
     * 教师创建讨论主题
     * @param {*} ctx 
     */
    static async createChat(ctx) {
        const { user } = ctx.session
        if (user && user.status === 2) {
            const { name, course_id, msg } = ctx.request.body
            const { id: teacher_id } = user

            if (name && course_id && teacher_id) {
                const dataList = await query(`insert into classChat 
                (name, course_id, teacher_id, msg) values 
                ('${name}', '${course_id}', '${teacher_id}', '${msg}')`)

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
     * 查询讨论主题
     * @param {*} ctx 
     */
    static async queryChat(ctx){
        const { user } = ctx.session
        const { course_id } =  ctx.request.query

        // 根据课程查询
        if (user && course_id) {
            const dataList = await query(`select * from classChat where course_id = '${course_id}'`)
            return ctx.body = {
                status: true,
                msg: 'success',
                data: dataList
            }

        }

        // 教师
        if (user && user.status === 2) {
            const { id } = user
            const dataList = await query(`select * from classChat where teacher_id = '${id}'`)
            return ctx.body = {
                status: true,
                msg: 'success',
                data: dataList
            }
        }
        // 学生

    }

    /**
     * 增加一条回复
     * @param {*} ctx 
     */
    static async addOneReply(ctx) {
        const { user } = ctx.session

        // 学生
        if(user && user.status === 1) {
            const { msg, chat_id } = ctx.request.body
            const { student_id, name} = user
            const time = sd.format(new Date(), 'MM-DD HH:mm:ss')
            if (msg && chat_id) {
                const dataList = await query(`insert into reply 
                (msg, chat_id, student_id, user_name, time) values 
                ('${msg}', '${chat_id}', '${student_id}', '${name}', '${time}')`)

                if (dataList.serverStatus === 2) {
                    return ctx.body = {
                        status: true,
                        msg:'success'
                    }
                }
            }
        }
        return ctx.body = {
            status: false,
            msg: 'errror'
        }
    }
 
    /**
     * 获取所有回复
     */

     static async queryReply(ctx) {
        const { user } = ctx.session
        const { id } = ctx.request.query
        if(user && id) {
            const dataList = await query(`select * from reply where chat_id = '${id}' order by id desc`)
            return ctx.body = {
                status: true,
                msg: 'success',
                data: dataList
            }
        }
        return ctx.body = {
            status: true,
            msg: 'success',
            data: dataList
        }
     }
}

module.exports = Char;