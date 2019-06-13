/*
 * @Author: sunmingming 
 * @Date: 2019-06-07 11:07:33 
 * @Last Modified by:   sunmingming 
 * @Last Modified time: 2019-06-07 11:07:33 
 */


const mysql = require('mysql');
const fs = require('fs')
const path = require('path')
// 创建数据库连接池
const file = path.join(__dirname, '../db.json'); //文件路径，__dirname为当前运行js文件的目录
/**
 * db.json
    {
        "host": "",
        "user": "",
        "password": "",
        "database": ""
    }
 * 
 */
const db_data= fs.readFileSync(file,'utf-8')

console.log('数据库配置文件读取成功！')
const pool = mysql.createPool(JSON.parse(db_data))

// 定义数据库查询函数
let query = function (sql, values) {
    // 返回Promise对象
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err)
            } else {
                // connection.query()指定具体的sql语句
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    // 结束会话
                    connection.release()
                })
            }
        })
    })
}


module.exports = { query }