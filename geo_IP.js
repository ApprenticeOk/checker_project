import axios from "axios";

export async function geoIP(ip) {
    try {
        const req = await axios(`https://ipwho.is/${ip}`);

        if (req.data.success == true) {
            return `IP: <code>${req.data.ip}</code>\nTipo-IP: <code>${req.data.type}</code>\nCidade: <code>${req.data.city}</code>\nRegião: <code>${req.data.region_code}</code>\nPaís: <code>${req.data.country}</code>\nCEP: <code>${req.data.postal}</code>\nProvedor: <code>${req.data.connection.org}</code>`;
        } else {
            return `IP: </code>${ip}\nStatus: </code>IP não localizado!</code>`;
        }
    } catch (error) {
        return `IP: ${ip}\nStatus: </code>Geolocalização falhou!</code>`;
    }
}