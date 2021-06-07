const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs'
});
connection.connect((err) => {
    if (err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
    console.log('接続成功');
});

app.use(
    session({
        secret: 'my_secret_key',
        resave: false,
        saveUninitialized: false,
    })
);

app.use((req, res, next) => {
    if (req.session.userId === undefined) {
        res.locals.username = 'ゲスト';
        res.locals.isLoggedIn = false;
        console.log("ログインしていない")
    } else {
        res.locals.name = req.session.username;
        res.locals.isLoggedIn = true;
        console.log("ログイン中")
    }
    next();
});

app.get('/', (req, res) => {
    res.render('top.ejs');
});
app.get('/login', (req, res) => {
    res.render('login.ejs');
});
app.post('/login', (req, res) => {
    const email = req.body.email;
    connection.query(
        'SELECT * FROM users WHERE email = ?', [email],
        (error, results) => {
            if (results.length > 0) {
                if (req.body.password === results[0].password) {
                    req.session.userId = results[0].id;
                    req.session.username = results[0].name;
                    res.redirect('/index');
                } else {
                    res.redirect('/login');
                }
            } else {
                res.redirect('/login');
            }
        }
    );
});

app.get("/logout", (req, res) => {
    req.session.destroy((error) => {
        res.redirect("/");
    });
});

app.get('/index', (req, res) => {
    connection.query(
        'SELECT * FROM lists',
        (error, results) => {
            res.render('index.ejs', { items: results });
        }
    );
});

app.get('/new', (req, res) => {
    res.render('new.ejs');
});

app.post('/create', (req, res) => {
    console.log(req.body.listName);
    connection.query(
        'INSERT INTO lists (name) VALUES(?)', [req.body.listName],
        (error, results) => {
            res.redirect('/index');
        });
});

app.post('/delete/:id', (req, res) => {
    connection.query(
        'DELETE FROM lists WHERE id = ?', [req.params.id],
        (error, results) => {
            res.redirect('/index');
        });
});

app.get('/edit/:id', (req, res) => {
    connection.query(
        'SELECT * FROM lists WHERE id = ?', [req.params.id],
        (error, results) => {
            res.render('edit.ejs', { item: results[0] });
        });
});

app.post('/update/:id', (req, res) => {
    connection.query(
        'UPDATE lists SET name = ? WHERE id = ?', [req.body.listName, req.params.id],
        (error, results) => {
            res.redirect('/index');
        });
});



app.listen(3000);