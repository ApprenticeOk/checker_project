import express from "express";
import { checker_bb, checker_sicredi } from "./api.js";
import "ejs";

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/checkerbb', (req, res) => {
    res.render('checker', {
        checker_name: 'Banco do Brasil',
        api_tag: 'apibb',
        limiter: 300,
        test_speed: 250,
        checker_css_em: '9em'
    });
});

app.get('/checkersicredi', (req, res) => {
    res.render('checker', {
        checker_name: 'Banco Sicredi',
        api_tag: 'apisicredi',
        limiter: 200,
        test_speed: 400,
        checker_css_em: '8.2em'
    });
});

app.get('/apibb', async (req, res) => {
    const query = req.query.lista;

    if (query == null || query == "") {
        return res.send(`<font style="color: red;">#Reprovada ${card_params} ➜ api ➜ empty card</font>`);
    }

    if (query.length != 28) {
        return res.send(`<font style="color: red;">#Reprovada ${card_params} ➜ api ➜ field needs 28 characters</font>`);
    }
    try {
        const exe_checker = await checker_bb(query);
        res.send(exe_checker);
    } catch (error) {
        return res.send(`<font style="color: red;">#Reprovada ${card_params} ➜ api ➜ api does not respond`);
    }
});

app.get('/apisicredi', async (req, res) => {
    const query = req.query.lista;

    if (query == null || query == "") {
        return res.send(`<font style="color: red;">#Reprovada ${card_params} ➜ api ➜ empty card</font>`);
    }

    if (query.length != 28) {
        return res.send(`<font style="color: red;">#Reprovada ${card_params} ➜ api ➜ field needs 28 characters</font>`);
    }
    try {
        const exe_checker = await checker_sicredi(query);
        res.send(exe_checker);
    } catch (error) {
        return res.send(`<font style="color: red;">#Reprovada ${card_params} ➜ api ➜ api does not respond`);
    }
});




app.listen(80);