// Imports
const { request } = require('express')
const express = require('express')
const app = express()
var mysql = require('mysql')
const port = 3306

// Static Files
app.use(express.static('public'))
app.use('/stylesheets', express.static(__dirname + 'public/stylesheets'))
app.use('/images', express.static(__dirname + 'public/images'))

//undefined to readble
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

// Set Views Engine
app.set('views', './views')
app.set('view engine', 'ejs')

//Mysql connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'password',
    database: 'waste_management_and_donations'
})
connection.connect(function (err) {
    if (err) throw err
    else console.log('connected to the mysql database')
})

//Registration 
app.post("/register", (req, res) => {
    username = req.body.username
    passwd = req.body.passwd[0]
    category = req.body.Category
    location = req.body.Location
    query = "insert into user_data value('" + username + "','" + passwd + "','" + category + "','" + location + "','[]','','');"
    connection.query(query), function (err) {
        if (err) throw err
        console.log('Values Inserted')
    }
    res.render('registered')
})

//global varibles
var user_data = ''
var username = ''
var passwd = ''

//Sign-in
app.post('/signin', (req, res) => {

    username = req.body.username
    passwd = req.body.passwd
    connection.query("SELECT * FROM user_data", function (err, result, fields) {
        if (err) throw err;
        for (i in result) {
            user_data=result
            store = result[i]
            for (j in store) {
                if (username === store[j]) {
                    if (passwd === store['password']) {
                        return res.redirect('Home')
                    }
                    return res.render('password')
                }}}
        return res.render('username')
    })
})

//Home
app.get('/Home', (req, res) => {
    if (user_data === '') res.redirect('/')
    else {
        var user_upload = user_data
        for (i in user_data) {
            if (user_data[i]['upload'] === '' || user_data[i]['upload'] === null) {
                delete user_upload[i]
            }
        }
        res.render('Home', {users:user_upload})
    }
})

//Edit-Profile
app.post('/edit-profile', (req, res) => {
    if (user_data === '') res.redirect('/')
    for (i in user_data) {
        if (username === user_data[i]['username'])
            return res.render('edit', { users: user_data[i] })
    }
})

//Upload
app.post('/upload', (req, res) => {
    if (user_data === '') res.redirect('/')
    upload = req.body.post
    query = 'update user_data set upload=' + "'" + upload + "'" + "where username='" + username + "' and password='" + passwd + "';"
    connection.query(query, (err) => {
        if (err) throw err
    })
    return res.redirect('Home')
})

//Notification
app.get('/notifications', (req, res) => {
    
    if (user_data === '') res.redirect('/')
    connection.query("select chat from user_data where username='" + username + "';", (err, result, field) => {
        for (i in result) {
            var chat = result[i]['chat'].split(':')
        }
        return res.render('notification', { user: chat })
    })
})

//Users
app.get('/:id', (req, res) => {
    if (user_data === '') res.redirect('/')
    var id = req.params.id
    if (id==='settings'){
        console.log('working')
        return res.redirect(username)
    }
    if (id === username) {
        console.log('working1')
        for (i in user_data) {
            console.log('working2',user_data[i]['username'],id)
            if (id === user_data[i]['username'])
                return res.render('settings', { users: user_data[i] })
        }
    }
    else {
        for (i in user_data) {
            console.log(user_data)
            console.log('working3',user_data[i]['username'],id)
            if (id === user_data[i]['username'])
                return res.render('User', { users: user_data[i] })
        }
    }
})

//Search 
app.post('/search', (req, res) => {
    if (user_data === '') res.redirect('/')
    var search = req.body.search
    connection.query("select username,category from user_data where username like'" + search.slice(0, 2) + "%';", (err,result,fields) => {
        if (err) throw err
        return res.render('Home', {users:result})
    })
})

//index
app.get('/', (req, res) => {
    res.render('index')
    /*var search = req.query.search;
    for (i in user_data) {
        if (search === user_data[i]['username'])
            res.render('User', { users: user_data[i] })
    }*/
})

//Message
app.get('/:id/message', (req, res) => {
    if (user_data === '') res.redirect('/')
    user = req.params.id
    data = req.query.message
    if (data !== undefined) {
        connection.query("update user_data set chat = '" + username + ':' + data + "' where username='" + user + "';", (err)=>{
            if (err) throw err
            return res.redirect(id)
        })
    }
    else res.render('message', { users: user })
})

app.post('save',(req,res)=>{
    
})
//  Listen on port 3000
app.listen(port, () => console.info(`Listening on port ${port}`))