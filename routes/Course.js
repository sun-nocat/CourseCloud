/*
 * @Author: sunmingming 
 * @Date: 2019-06-08 11:47:48 
 * @Last Modified by: sunmingming
 * @Last Modified time: 2019-06-08 20:55:49
 */

var fs=require("fs");

var path=require("path");

var router=require("koa-router")();

// var static=require("koa-static");
const {
    query
} = require('../config/db.js')
const {
    stringAdd
} = require('../common/stringAdd.js')
const {
    stringDel
} = require('../common/stringDel.js')
const _ = require('lodash')

class Course {

    /**
     * 创建课程  分为私有和公有
     */
    static async createCourse(ctx) {
        const {
            user
        } = ctx.session;

        // 教师登录
        if (user && user.status === 2) {
            const {
                name,
                status,
                dept,
                requires,
                grade
            } = ctx.request.body
            const {
                id: teacher_id
            } = user

            console.log(ctx.request.body)
            console.log(user)
            const dataList = await query(`insert into course
                 (name, status, dept, requires, grade, teacher_id) values 
                 ('${name}', '${status}', '${dept}', '${requires}', '${grade}', ${teacher_id})
                 `)
            if (dataList.serverStatus === 2) {
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
     * 文件下载
     */

     static async download(ctx) {
        const send = require('koa-send');
        //  const name = ctx..name;
        console.log('下载')
         const { path } = ctx.request.query
         console.log(path)
         const ss = `\\routes\\static\\upload\\`  + path 
        //  console.log(ss)
         ctx.attachment(ss);
          await send(ctx, ss);
        
     }





    /**
     * 查询课程
     * @param {*} ctx 
     */
    static async queryCourse(ctx) {
        const {
            user
        } = ctx.session

        // 学生登录
        if (user) {
            // 查询的是私有课程还是公有课程
            const {
                status,
                teacher_id,
                grade,
                requires
            } = ctx.request.query
            // 根据不同的条件去查询
            if (status) {
                const data = await selectCourse('status', status)
                return ctx.body = {
                    status: true,
                    data: data
                }
            }
            if (teacher_id) {
                return ctx.body = {
                    status: true,
                    data: await selectCourse('teacher_id', teacher_id)
                }
            }
            if (grade) {
                return ctx.body = {
                    status: true,
                    data: await selectCourse('grade', grade)
                }
            }
            if (requires) {
                return ctx.body = {
                    status: true,
                    data: await selectCourse('requires', requires)
                }
            }

            const dataList = await query(`select * from course`)
            return ctx.body = {
                status: true,
                data: dataList
            }
        }

        return ctx.body = {
            status: false,
            msg: 'error'
        }
    }
    /**
     * 查询自己已经选择的课程
     * @param {*} ctx 
     */
    static async myCourse(ctx) {
        const {
            user
        } = ctx.session

        // 学生登录
        if (user) {
            // 查询的是私有课程还是公有课程
            const {
                status,
                teacher_id,
                grade,
                requires
            } = ctx.request.query


            const {
                course_id
            } = user

            if (!course_id) {
                return ctx.body = {
                    status: false,
                    msg: '用户没有选课'
                }
            }

            const Courses = course_id.split(',')
            console.log("course_ids")
            console.log(Courses)
            const allData = []
            for (let i = 0; i < Courses.length; i++) {
                const sql = `select * from course where id = ${parseInt(Courses[i])}`
                const dataList = await query(sql)
                dataList.forEach(element => {
                    allData.push(element);

                });
            }

            return ctx.body = {
                status: true,
                data: allData
            }




        }

        return ctx.body = {
            status: false,
            msg: 'error'
        }
    }

    /**
     * 选择课程
     */
    static async chooseCourse(ctx) {
        const {
            user
        } = ctx.session;
        // 学生登录
        if (user && user.status === 1) {
            const {
                id: course_id
            } = ctx.request.query
            const {
                id: student_id
            } = user
            console.log(student_id)
            if (course_id) {
                // 更新课程表
                const courseData = await query(`select student_id from course where id = '${course_id}'`)
                const newCourseData = courseData ? courseData : stringAdd(courseData[0].student_id, student_id)
                const newCourseDataList = await query(`update course set student_id = '${newCourseData}' where id = '${course_id}'`)
                // 更新学生表
                const studentData = await query(`select course_id from student where id = '${student_id}'`)
                const newStudentData = stringAdd(studentData[0].course_id, course_id)
                const newStudentDataList = await query(`update student set course_id = '${newStudentData}' where id = '${student_id}'`)

                if (newCourseDataList.serverStatus === 2 && newStudentDataList.serverStatus === 2) {
                    user.course_id = newStudentData
                    ctx.session.user = user // 更新session中的选课信息
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


    static async queryCourseMsg(ctx){
        const { user } = ctx.session
        if (user) {
             const dataList = await query(`select * from information where courseStatus = 0`)
             const dataLists = await query(`select * from information where courseStatus = 1`)

             return ctx.body = {
                 status: true,
                 data:{
                     public:dataList,
                     private: dataLists
                 }
             }
        }

        return ctx.body = {
            status: false

        }
    }

    /**
     * 上传课程信息
     */

    static async uploadCourse(ctx) {
        const {
            user
        } = ctx.session
        console.log('upload捷库')
        console.log(user)
        console.log('上传文件')
        // console.log(ctx.request.body)
        // console.log(ctx.request.files)

        // 上传图片
        // if (name && course_id && img) {
        const file = ctx.request.files.file;
        const uploadUrl= "C:/code/ClouseCloud_/routes" + "/static/upload"; 
        console.log('地址')
        console.log(uploadUrl)
        const { course_id , msg, data } = ctx.request.body
        console.log(msg)

        const reader = fs.createReadStream(file.path);

        let filePath = __dirname + "/static/upload/";

        let fileResource = filePath + `/${file.name}`;

        if (!fs.existsSync(filePath)) { //判断staic/upload文件夹是否存在，如果不存在就新建一个

            fs.mkdir(filePath, (err) => {

                if (err) {

                    throw new Error(err)

                } else {

                    let upstream = fs.createWriteStream(fileResource);

                    reader.pipe(upstream);
                    return ctx.body = {
                        url: uploadUrl + `/${file.name}`

                    }

                }

            })

        } else {

            let upstream = fs.createWriteStream(fileResource)

            reader.pipe(upstream);

            const CourseData = await query(`select * from course where id = '${course_id}'`)

            const courseName = CourseData[0].name
            const courseStatus = CourseData[0].status

            // 此时文件已经长传成功   

            const urlss =  uploadUrl + `/${file.name}`
            const dataList = await query(`insert into information (name, course_id, file, msg, courseName, courseStatus) values ('${file.name}','${course_id}', '${urlss}', '${msg}', '${courseName}', '${courseStatus}' )`)

            return   ctx.body = {

                url: uploadUrl + `/${file.name}` //返给前端一个url地址
            }

          
        }


    }

    /**
     * 删除选课学生
     */

    static async delCourseStudent(ctx) {
        const {
            user
        } = ctx.session

        if (user && user.status === 1) {
            const {
                id: course_id
            } = ctx.request.query
            const {
                id
            } = user

            if (id && course_id) {


                // 删除选课表
                const courseData = await query(`select student_id from course where id = '${course_id}'`)
                const newCourseData = stringDel(courseData[0].student_id, id)
                const newCourseDataList = await query(`update course set student_id = '${newCourseData}' where id = '${course_id}'`)
                console.log(newCourseDataList)
                // 更新学生表
                const studentData = await query(`select course_id from student where id = '${id}'`)
                const newStudentData = stringDel(studentData[0].course_id, course_id)
                console.log('选课')
                console.log(newStudentData)
                const newStudentDataList = await query(`update student set course_id = '${newStudentData}' where id = '${id}'`)

                if (newCourseDataList.serverStatus === 2 && newStudentDataList.serverStatus === 2) {
                    user.course_id = newStudentData
                    ctx.session.user = user // 更新session中的班级信息
                    return ctx.body = {
                        status: true,
                        msg: 'success'
                    }

                }

            }

        }





        if (user && user.status === 2) {
            const {
                student_id,
                course_id
            } = ctx.request.query

            if (student_id && course_id) {


                // 删除选课表
                const courseData = await query(`select student_id from course where id = '${course_id}'`)
                const newCourseData = stringDel(courseData[0].student_id, student_id)
                const newCourseDataList = await query(`update course set student_id = '${newCourseData}' where id = '${course_id}'`)
                console.log(newCourseDataList)
                // 更新学生表
                const studentData = await query(`select course_id from student where id = '${student_id}'`)
                const newStudentData = stringDel(studentData[0].course_id, course_id)
                const newStudentDataList = await query(`update student set course_id = '${newStudentData}' where id = '${student_id}'`)

                if (newCourseDataList.serverStatus === 2 && newStudentDataList.serverStatus === 2) {

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
 * 根据不同的条件去query课程
 */
async function selectCourse(param, paramData) {
    console.log('2')

    const dataList = await query(`select * from course where ${param} = '${paramData}'`)
    console.log('3')

    console.log(dataList)
    return dataList[0]
}


module.exports = Course