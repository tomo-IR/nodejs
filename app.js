const express = require('express');
const mysql = require('mysql2');
const app = express();

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