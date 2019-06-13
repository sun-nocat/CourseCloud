/*
 * @Author: sunmingming 
 * @Date: 2019-06-07 20:04:35 
 * @Last Modified by: sunmingming
 * @Last Modified time: 2019-06-09 17:43:46
 */

const { query } = require('../config/db.js')
const _ = require('lodash')

class Class {

    /**
     * 创建班级
     */
    static async createClass(ctx) {
        const { user } = ctx.session
        // 教师登录
        if (user && user.status === 2) {
            const { name, msg, password } = ctx.request.body
            const { id } = user
            const sql = `insert into class (name, msg, password, teacher_id) 
            values ('${name}', '${msg}', '${password}', '${id}')`
            const dataList = await query(sql)
            if (!_.isEmpty(dataList)) {
                return ctx.body = {
                    status: true,
                    msg: 'success'
                }
            }
        }
        return ctx.body = {
            status: false,
            msg: 'error'
        }
    }



    /**
     * 查询班级,根据班级的id去查询班级。
     * 学生查询时，需要提供班级的id 教师查询时，将查询教师创建的所有班级
     */
    static async queryClass(ctx) {
        const { user } = ctx.session
        const { type } = ctx.request.query

        // 查询所有的数据
        if (user && type) {
            const sql = `select * from class`
            const dataList = await query(sql)
            return ctx.body = {
                status: true,
                msg: 'success',
                data: dataList
            }
        }
        // 教师登录
        if (user && user.status === 2) {
            const { id } = ctx.request.query  // 班级的id
            // 教师如果提供指定给的班级id的话，就让他查，如果他不提供指定的班级id的话，就查他创建的班级
            let sql
            if (id) {
                sql = `select * from class where id = '${id}'`
            } else {
                sql = `select * from class where teacher_id = '${user.id}'`
            }

            const dataList = await query(sql)

            if (!_.isEmpty(dataList)) {
                return ctx.body = {
                    status: true,
                    msg: 'success',
                    data: dataList
                }
            }
        }

        // 学生登录  1. 查询自己的班级信息  
        if (user && user.status === 1) {
            const { class_id } = user;

            if (class_id !== null && class_id !== '') {
                const class_ids = class_id.split(',')
                console.log('ssssss')
                console.log(class_ids);
                console.log(class_ids)
                const allData = []
                for (let i = 0; i < class_ids.length; i++) {
                    const sql = `select * from class where id = ${parseInt(class_ids[i])}`
                    const dataList = await query(sql)
                    dataList.forEach(element => {
                        allData.push(element);

                    });
                }

                return ctx.body = {
                    status: true,
                    msg: 'success',
                    data: allData
                }
            }
            return ctx.body = {
                status: false,
                msg: '没有选择课程'
            }
        }
        return ctx.body = {
            status: false,
            msg: 'error'
        }
    };



    /***
     * 加入班级 需要提供班级的 id
     */

    static async joinClass(ctx) {
        const { user } = ctx.session
        // 学生登录
        if (user && user.status === 1) {
            const { id } = ctx.request.query // 获取班级的id
            const { class_id, id: userId } = user
            console.log(class_id);
            // 不能重复加入同一个班级
            if (class_id && _.find(class_id.split(','), id)) {
                return ctx.body = {
                    status: false,
                    msg: '已经加入此班级'
                }
            }

            const newClass_id = stringAdd(class_id, id)
            // 更新学生表信息
            console.log(newClass_id)
            const dataList = await query(`update student set class_id = '${newClass_id}' where id = '${userId}'`)
            if (dataList.serverStatus === 2) {
                // 获取班级内的学生id
                const classStudentId = await query(`select student_id from class where id = '${id}'`)
                const newClassStudentId = classStudentId === null ? userId : stringAdd(classStudentId[0].student_id, userId)

                // 更新班级表中的信息
                const dataList2 = await query(`update class set student_id = '${newClassStudentId}' where id = '${id}'`)

                if (dataList2.serverStatus === 2) {
                    const cew = newClass_id
                    user.class_id =cew
                    ctx.session.user = user // 更新session中的班级信息
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
     * 退出班级 提供班级的  id
     */

    static async exitClass(ctx) {
        const { user } = ctx.session
        // 学生登录
        if (user && user.status === 1) {
            const { id } = ctx.request.query // 获取班级的id
            const { class_id, id: userId } = user

            const newClass_id = stringDel(class_id, id)

            const sql = `update student set class_id = '${newClass_id}' where id = '${userId}'`
            const dataList = await query(sql)

            if (dataList.serverStatus === 2) {

                const dataList2 = exitClassSql(id, userId)
                if (dataList2) {
                    user.class_id = newClass_id
                    ctx.session.user = user // 更新session中的班级信息
                    return ctx.body = {
                        status: true,
                        msg: 'success'
                    }
                }
            }




        }

        // 教师登录，教师可以让学生退出自己的班级
        if (user && user.status === 2) {
            // 获取班级的id  和学生的 id
            const { id: class_id, student_id } = ctx.request.query
            // 查询学生加入的班级
            const studentClassData = await query(`select class_id from student where id = '${student_id}'`)
            console.log(studentClassData)
            const newClass_id = stringDel(studentClassData[0].class_id, class_id)
            const sql = `update student set class_id = '${newClass_id}' where id = '${student_id}'`
            const dataList = await query(sql)
            if (dataList.serverStatus === 2) {

                const dataList2 = exitClassSql(class_id, student_id)
                if (dataList2) {
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


/**
 * 在字符串后边加一个数据   a,a,s  -> a,a,s,d
 */
function stringAdd(string, addData) {
    if (string === null || string === '') {
        return addData
    }
    console.log('string----------------')
    console.log(string)
    const ArrData = string.split(',')
    const aaa = ArrData.filter(item => typeof item === null)
    aaa.push(addData)
    return _.pull(aaa, '').join() // 过滤空字符串
}

/**
 * 在字符串中删除一个数数据   a,a,s  -> a,a
 */
function stringDel(string, delData) {
    console.log('string')
    console.log(string)
    console.log(delData)
    const ArrData = string.split(',')
    _.pull(ArrData, '')
    return _.pull(ArrData, String(delData)).join()
}


/**
 * 学生退出班级
 * @param {*} id 班级id
 * @param {*} userId 学生id
 */
async function exitClassSql(id, userId) {
    const classStudentId = await query(`select student_id from class where id = '${id}'`)
    const newClassStudentId = stringDel(classStudentId[0].student_id, userId)
    // 更新班级表中的信息
    const dataList2 = await query(`update class set student_id = '${newClassStudentId}' where id = '${id}'`)
    return dataList2.serverStatus === 2
}

module.exports = Class;