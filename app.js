const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
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
        console.log("ログインしていないので実行しません")
    } else {
        res.locals.username = req.session.username;
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
                const plain = req.body.password;
                const hash = results[0].password;
                bcrypt.compare(plain, hash, (error, isEqual) => {
                    if (isEqual) {
                        req.session.userId = results[0].id;
                        req.session.username = results[0].name;
                        res.redirect('/index');
                        console.log("ログインできました。")
                    } else {
                        res.redirect("/login");
                        console.log("ログインできませんでした。")
                    }
                });
            } else {
                res.redirect('/login');
            }
        });
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

app.get('/golf', (req, res) => {
    res.render('golf.ejs');
});

app.get('/signup', (req, res) => {
    res.render('signup.ejs', { errors: [] });
});

app.post('/signup',
    (req, res, next) => {
        console.log("入力値の空チェック")
        const username = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const errors = [];

        if (username === "") {
            errors.push("ユーザー名がカラです。");
        }
        if (email === "") {
            errors.push("メールアドレスがカラです。");
        }
        if (password === "") {
            errors.push("パスワードがカラです。");
        }
        console.log(errors);
        if (errors.length > 0) {
            res.render("signup.ejs", { errors: errors });
        } else {
            next();
        }
    },

    (req, res, next) => {
        console.log("メアド重複チェック")
        const email = req.body.email;
        const errors = [];
        connection.query(
            'SELECT * FROM users WHERE email = ?', [email],
            (error, results) => {
                if (results.length > 0) {
                    errors.push("このメールアドレスは既に使われています。")
                    res.render("signup.ejs", { errors: errors });
                } else {
                    next();
                }
            }
        );
    },

    (req, res) => {
        console.log("ユーザー登録");
        const username = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        bcrypt.hash(password, 10, (error, hash) => {
            connection.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [username, email, hash],
                (error, results) => {
                    console.log(results)
                    req.session.userId = results.insertId;
                    req.session.username = username;
                    console.log(req.session.userId);
                    console.log(req.session.username);
                    res.redirect('/index');
                }
            );
        });
    }
);


app.post('/create', (req, res) => {
    console.log(req.body.listName);
    console.log("投稿するよ");
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