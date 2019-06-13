/*
 * @Author: sunmingming 
 * @Date: 2019-06-07 16:29:35 
 * @Last Modified by: sunmingming
 * @Last Modified time: 2019-06-09 12:22:23
 */

const { query } = require('../config/db.js')
const _ = require('lodash')

// 使用类来封装对应模块的接口来实现对应的功能

class User {
	// 使用静态方法来定义接口处理函数，避免使用New操作符

	/**
	 * 验证用户登录
	 */
	static async login(ctx) {
		if (ctx.session.user) {
			ctx.body = {
				msg: '用户已经登录',
				status: true
			}
			return;
		}

		const { account } = ctx.request.body || null;
		const { password } = ctx.request.body || null;
		const { user } = ctx.request.body || null;
		if (!account || !password || !user) {
			ctx.body = {
				status: 0,
				msg: '用户名或者密码不能为空'
			}
			return;
		}
		// 从数据库中查找用户信息 
		console.log('读取数据库')
		var dataList = await query(`select * from ${user} where account = '${account}'`)
		console.log(dataList)
		// 判断数据库中是否存在用户信息

		if (_.isEmpty(dataList)) {
			console.log('用户不错在');
			ctx.body = {
				status: 0,
				msg: '用户不存在'
			}
			return;
		}
		console.log(dataList[0].name);

		if (dataList[0].account === account && dataList[0].password === password) {
			console.log('账号密码正确！');
			// 将用户的信息，保存在session中
			ctx.session.user = dataList[0]
			return ctx.body = {
				status: true,
				msg: '登录成功',
				data: {
					status: dataList[0].status, // 返回用户的类型
					id: dataList[0].id,
					// name: dataList[0].name,
					// student_id: dataList[0].student_id
				}
			}
		}
		return ctx.body = {
			status: false,
			msg: '登录失败！'
		}

	}

	/**
	 * 注销接口
	 * @param {*} ctx 
	 */
	static async logout(ctx) {
		if (ctx.session.user) {
			ctx.session.user = null;
			return ctx.body = {
				status: true,
				msg: '注销成功'
			}
		}
		return ctx.body = {
			status: false,
			msg: '用户未登录'
		}
	}

	/**
	 * 用户注册(管理员，教师)
	 */
	static async register(ctx) {
		// 获取用户类别	
		const { user } = ctx.request.body;

		if (user === 'student') {
			console.log('开始注册')

			let { name, account, sex, tel, email, student_id, password } = ctx.request.body || null;
			console.log(name, account, sex, tel, email, student_id, password )
			if (account && name && student_id && password) {
				console.log('开始注册')

				const data = await query(`select * from student where account = ${account}`)
				if (!_.isEmpty(data)) {
					return ctx.body = {
						status: 0,
						msg: '账号已经存在'
					}
				}
				let dataList = await query(`insert into student ( name, account, sex, tel, email, student_id, password, status) values ( '${name}', '${account}', '${sex}', '${tel || null}', '${email || null}', '${student_id}', '${password}', 1)`)
				if (dataList.serverStatus === 2) {
					return ctx.body = {
						status: 1,
						msg: '注册成功'
					}
				}
			}
		}

		if (user === 'teacher') {
			let { account, name, teacher_id, sex, title, dept_num, password, tel, email } = ctx.request.body || null;
			if (account && name && teacher_id && password) {
				const data = await query(`select * from teacher where account = ${account}`)
				if (!_.isEmpty(data)) {
					return ctx.body = {
						status: 0,
						msg: '账号已经存在'
					}
				}
				let dataList = await query(`insert into teacher (account, name, teacher_id, sex, title, dept_num, password, status, tel, email) values ('${account}', '${name}', '${teacher_id}', '${sex}', '${title || null}', '${dept_num || null}', '${password}', 2, '${tel || null}', '${email || null}')`)
				if (dataList.serverStatus === 2) {
					return ctx.body = {
						status: 1,
						msg: '注册成功'
					}
				}
			}
		}


		return ctx.body = {
			status: false,
			msg: '注册失败'
		}
	}

	/**
	 * 获取个人信息
	 */
	static async getMessage(ctx) {
		const { user } = ctx.session;
		console.log(user);
		if (user) {
			const { id, status } = user;

			// 管理员登录,可以获取所有人的信息
			if (status !== 1 && status !== 2) {
				const sqlStudent = `select * from student`
				const sqlTeacher = `select * from teacher`
				const dataListStu = await query(sqlStudent)
				const dataListTea = await query(sqlTeacher)

				return ctx.body = {
					status: true,
					data: {
						student: dataListStu,
						teacher: dataListTea,
					}
				}
			}

			// 除管理员之外其他人只能获取自己的个人信息
			const obj = {
				1: 'student',
				2: 'teacher',
				3: 'admin'
			}
			const dataList = await query(`select * from ${obj[status]} where id = '${id}'`)
			console.log(dataList);

			return ctx.body = {
				status: true,
				msg: dataList[0]
			}
		}
		return ctx.body = {
			status: false,
			msg: '未登录'
		}
	}

	/**
	 * 更新个信息
	 */
	static async updateMessage(ctx) {
		const { user } = ctx.session;
		// 在管理员更新用户信息的时候，需要指明更新的是学生的信息还是教师的信息
		const { who } = ctx.request.body
		// 学生更新
		if (!user) {
			return ctx.body = {
				status: false
			}
		}

		// 学生以及管理员登录
		if (user.status === 1 || (user.status === 3 && who === 1)) {

			const { id } = ctx.request.body;
			let ids = user.id //当前登录的用户的id
			// 管理员登录  并且获取到前端传递的 id  --> 需要更改的用户的id
			if (user.status === 3 && id) {
				// 从教师表中获取到数据
				ids = id;
				let dataTeacherList = await query(`select * from student where id = '${id}'`)
				if (!_.isEmpty(dataTeacherList)) {
					const isSuccess = returnMessageStudent(dataTeacherList[0], ctx, ids)
					if (isSuccess) {
						return ctx.body = {
							status: true,
							msg: 'success'
						}
					}
				}
			}
			// 学生
			const isSuccess = returnMessageStudent(user, ctx, ids)
			if (isSuccess) {
				return ctx.body = {
					status: true,
					msg: 'success'
				}
			}
		}

		// 教师更新
		if (user.status === 2 || (user.status === 3 && who === 2)) {
			const { id } = ctx.request.body;
			let ids = user.id //当前登录的用户的id
			// 管理员登录  并且获取到前端传递的 id  --> 需要更改的用户的id
			if (user.status === 3 && id) {
				// 从教师表中获取到数据
				ids = id;
				let dataTeacherList = await query(`select * from teacher where id = '${id}'`)
				if (!_.isEmpty(dataTeacherList)) {
					const isSuccess = returnMessage(dataTeacherList[0], ctx, ids)
					if (isSuccess) {
						return ctx.body = {
							status: true,
							msg: 'success'
						}
					}
				}
			}

			// 教师登录
			const isSuccess = returnMessage(user, ctx, ids)
			if (isSuccess) {
				return ctx.body = {
					status: true,
					msg: 'success'
				}
			}

		}

		return ctx.body = {
			status: false
		}
	}


}


/**
 * 教师更新
 * @param {*} user 之前的用户数据 
 * @param {*} ctx 需要刚改的用户数据
 * @param {*} ids 用户的id
 */
async function returnMessage(user, ctx, ids) {
	const { name, sex, title, dept_num, password, tel, email, teacher_id, class_id, course_id } = ctx.request.body;
	const { name: _name, sex: _sex, title: _title, dept_num: _dept_num, password: _password, tel: _tel, email: _email, teacher_id: _teacher_id, class_id: _class_id, course_id: _course_id } = user;
	console.log('ssssssss');
	console.log(user)
	console.log(ctx.request.body)

	const sql =
		`update teacher set name = '${name || _name}', sex = '${sex || _sex}',
		title = '${title || _title}', dept_num = '${dept_num || _dept_num}', 
		password = '${password || _password}', tel = '${tel || _tel}',
		email = '${email || _email}', teacher_id = '${teacher_id || _teacher_id}', 
		class_id = '${class_id || _class_id}', course_id = '${course_id || _course_id}' 
		where id = '${ids}'`

	const dataList = await query(sql)

	return dataList.serverStatus === 2
}


/**
 *  学生更新
 */
async function returnMessageStudent(user, ctx, ids) {
	const { name, sex, msg, tel, email, password, grade, class_id, course_id, student_id } = ctx.request.body;
	const { name: _name, sex: _sex, msg: _msg, tel: _tel, email: _email, password: _password, grade: _grade, class_id: _class_id, course_id: _course_id, student_id: _student_id } = user;

	const sql = `update student set name = '${name || _name}', sex = '${sex || _sex}',
		msg = '${msg || _msg}', tel = '${tel || _tel}', 
		email = '${email || _email}', password = '${password || _password}',
		grade = '${grade || _grade}', class_id = '${class_id || _class_id}',
		course_id = '${course_id || _course_id}', student_id = '${student_id || _student_id}'
		where id = '${ids}'
	`
	const dataList = await query(sql)

	return dataList.serverStatus === 2
}

module.exports = User; 