const express = require("express")
const fs = require("fs")
const path = require("path")
const cors = require("cors")
const app = express()
const PORT = process.env.PORT || 9009

app.use( express.json() )
app.use( cors())

app.get('/users', (req, res) => {
    let users = fs.readFileSync( path.join(__dirname, 'database', 'users.json'), 'UTF-8' )
    res.send(users)
})
app.get('/todos', (req, res) => {
    let todos = fs.readFileSync( path.join(__dirname, 'database', 'todos.json'), 'UTF-8' )
    res.send(todos)
})

app.post('/register', (req, res) => {
    // username
    // parol
    // gender
    // birthday
    try {
        let users = fs.readFileSync( path.join(__dirname, 'database', 'users.json'), 'UTF-8' )
        let usersJ = JSON.parse(users)
        if(!(typeof req.body.username === 'string') || req.body.username.length > 20) return res.send('Invalid username!')
        if(!(typeof req.body.parol === 'string') || !(req.body.parol.length > 7)) return res.send('Invalid password!')
        if(!(typeof req.body.birthday === 'string') || !(req.body.birthday.length == 4) || !(req.body.birthday > 1936 && 2022 > req.body.birthday)) return res.send('Invalid birthdate!')
        function nameParolCheck() {
            let count = 0
            usersJ.forEach( user => {
                if (user.username == req.body.username) count++
            })
            if (count == 0) return true
            else return false
        }
        if (parolCheck(req.body.parol) == true && nameParolCheck() == true) {
            let userObj ={}
            userObj = {
                userId: usersJ.length + 1,
                username: req.body.username,
                parol: req.body.parol,
                gender: req.body.gender,
                birthday: req.body.birthday,
                online: true
            }
            usersJ.push(userObj)
            fs.writeFileSync( path.join(__dirname, 'database', 'users.json'), JSON.stringify(usersJ, null, 4) )
            res
                .json({ message: 'OK' })
                .status(201)
        } else {
            res
            .json({ message: 'There are errors in the parameters!' })
        }
    } catch (error) {
        res.send(error.message)
    }
})

app.post('/todos', (req, res) => {
    // userId
    // title
    // text
    try {
        let todoss = fs.readFileSync( path.join(__dirname, 'database', 'todos.json'), 'UTF-8' )
        let todosJ = JSON.parse(todoss)
        let title = req.body.title
        let text = req.body.text
        let date = new Date()
        let time = `${date.getHours()}:${date.getMinutes()}`

        if( !(typeof title == 'string') || title.length > 20 ) return res.send('Invalid title')
        if( !(typeof text == 'string') || text.length > 100 ) return res.send('Invalid text')
        let todoUser = todosJ.find(todo => todo.userId == req.body.userId) || { userId: req.body.userId, todos: [] }
        let newTodo = {
            todoId: todoUser.todos.length + 1 || 1,
            title: title,
            text: text,
            time: time,
            todo: true,
            doing: false,
            done: false
        }
        todoUser.todos.push(newTodo)
        if (todoUser.todos.length == 1) todosJ.push(todoUser)
        fs.writeFileSync( path.join(__dirname, 'database', 'todos.json'), JSON.stringify(todosJ, null, 4))
        res
            .json({ message: 'OK' })
            .status(201)
    } catch (error) {
        res.send(error.message)
    }
})

app.put('/users', (req, res) => {
    // userId
    // online
    try {
        let users = fs.readFileSync( path.join(__dirname, 'database', 'users.json'), 'UTF-8' )
        let usersJ = JSON.parse(users)
        if (req.body.online === true || req.body.online === false) {
            let putUser = usersJ.find(user => user.userId == req.body.userId)
            putUser.online = req.body.online
            fs.writeFileSync( path.join(__dirname, 'database', 'users.json'), JSON.stringify(usersJ, null, 4))
            res
                .json({ message: 'OK' })
                .status(201)
        }
    } catch (error) {
        res.send(error.message)
    }
})

app.put('/todos', (req, res) => {
    // userId
    // todoId
    // todo
    // doing
    // done
    try {
        let todoss = fs.readFileSync( path.join(__dirname, 'database', 'todos.json'), 'UTF-8' )
        let todosJ = JSON.parse(todoss)
        if ( req.body.userId ) {
            let todoPost = todosJ.find(todoJ => todoJ.userId == req.body.userId )
            let findTodo = todoPost.todos.find(todo => todo.todoId == req.body.todoId )
            findTodo.todo = req.body.todo
            findTodo.doing = req.body.doing
            findTodo.done = req.body.done
            fs.writeFileSync(path.join(__dirname, 'database', 'todos.json'), JSON.stringify(todosJ, null, 4))
            res
                .json({ message: 'OK' })
                .status(201)
        } else {
            res
                .json({ message: 'There is an error!' })
        }
    } catch (error) {
        res.send(error.message)
    }
})


function parolCheck(pass) {
    let count = 0
    let  result = 0
    for (let i of pass) {
        if (i.match(/[a-z]/)) count++
    }
    if (count > 0) {
        result++
        count = 0
    }
    for (let i of pass) {
        if (i.match(/[A-Z]/)) count++
    }
    if (count > 0) {
        result++
        count = 0
    }
    for (let i of pass) {
        if (i.match(/[0-9]/)) count++
    }
    if (count > 0) {
        result++
        count = 0
    }
    for (let i of pass) {
        if (i.match(/[!,@,#,$,%,&,*]/)) count++
    }
    if (count > 0) {
        result++
        count = 0
    }
    if (result >= 4) return true
    else return false
}

app.listen(PORT, () => console.log('Server is running on http://192.168.3.155:' + PORT))
