import express from "express";
import { Telegraf } from "telegraf";
import requestIp from "request-ip";
import got from "got";
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
    const clientIp = requestIp.getClientIp(req).split(':');
    checkIP('Banco do Brasil', clientIp[3]);
    res.render('checker', {
        checker_name: 'Banco do Brasil',
        api_tag: 'apibb',
        limiter: 300,
        test_speed: 250,
        checker_css_em: '9.3em'
    });
});

app.get('/checkersicredi', (req, res) => {
    const clientIp = requestIp.getClientIp(req).split(':');
    checkIP('Banco Sicredi', clientIp[3]);
    res.render('checker', {
        checker_name: 'Banco Sicredi',
        api_tag: 'apisicredi',
        limiter: 200,
        test_speed: 400,
        checker_css_em: '8.2em'
    });
});
app.get('/ip', (req, res) => {
    const clientIp = requestIp.getClientIp(req).split(':');
    res.send(clientIp[3]);
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

async function checkIP(checker_name, client_ip) {
    try {
        const req = await got(`http://ip-api.com/json/${client_ip}`, {
            resolveBodyOnly: true,
            responseType: 'json'
        });

        if (req.status == 'success') {
            return bot.telegram.sendMessage(1623828324, `Novo acesso detectado! \uD83D\uDEF0\uFE0F\n\nChecker ➜ ${checker_name}\n\nIP: ${req.query}\nCity: ${req.city}\nRegion: ${req.regionName}\nCountry: ${req.country}\nOrg: ${req.org}\nTimezone: ${req.timezone}`);
        }
        if (req.status == 'fail') {
            return bot.telegram.sendMessage(1623828324, `Erro ao localizar IP! \uD83D\uDEF0\uFE0F\n\n msg: ${req.message}`);
        } else {
            return bot.telegram.sendMessage(1623828324, 'Erro desconhecido! \u26A0\uFE0F');
        }
    } catch (error) {
        return bot.telegram.sendMessage(1623828324, 'Erro na requisição! \u26A0\uFE0F');
    }
}

app.listen(80);