//@ts-ignore
const toHexString = (bytes: Uint8Array): string => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

/**
 * Get random string
 * @param n length of the string
 */
export const rnds = (n: number): string => toHexString(crypto.getRandomValues(new Uint8Array(n))).slice(0, n);

/**
 * Simple email validation
 * @param mail Email string
 */
export const validMail = (mail: string) => /^[\w\.\-\_]+\@[\w\-\_]+\.[\w\-\_]+$/.test(mail);

/**
 * Simple post request with fetch and optional bearer token for json results
 * @param url Url to fetch
 * @param body Object to send
 * @param token Optional bearer token
 */
export const post = async (url: string, body: any, token?: string) => {
    return fetch(url, {
        method: "post",
        headers: token ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        } : {
                'Content-Type': 'application/json'
            },
        mode: "cors",
        redirect: "follow",
        body: JSON.stringify(body)
    }).then(_ => _.json()).catch(_ => { error: _ });
};


/**
 * Return the hex hash of a text
 * @param v text to be hashed
 */
export const sha256 = (v: string) => {
    //@ts-ignore
    function e(c, b) { var d = (c & 65535) + (b & 65535); return (c >> 16) + (b >> 16) + (d >> 16) << 16 | d & 65535 } function k(c, b) { return c >>> b | c << 32 - b } v = function (c) { c = c.replace(/\r\n/g, "\n"); for (var b = "", d = 0; d < c.length; d++) { var a = c.charCodeAt(d); 128 > a ? b += String.fromCharCode(a) : (127 < a && 2048 > a ? b += String.fromCharCode(a >> 6 | 192) : (b += String.fromCharCode(a >> 12 | 224), b += String.fromCharCode(a >> 6 & 63 | 128)), b += String.fromCharCode(a & 63 | 128)) } return b }(v); return function (c) {
        for (var b = "", d = 0; d < 4 * c.length; d++)b += "0123456789abcdef".charAt(c[d >>
            2] >> 8 * (3 - d % 4) + 4 & 15) + "0123456789abcdef".charAt(c[d >> 2] >> 8 * (3 - d % 4) & 15); return b
    }(function (c, b) {
        var d = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051,
            2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298], a = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], n = Array(64); c[b >> 5] |= 128 << 24 - b % 32; c[(b + 64 >> 9 << 4) + 15] = b; for (var y = 0; y < c.length; y += 16) {
                var p = a[0]; var r = a[1]; var t = a[2]; var z = a[3];
                var q = a[4]; var w = a[5]; var x = a[6]; var m = a[7]; for (var h = 0; 64 > h; h++) { var l = h; if (16 > h) var f = c[h + y]; else { f = n[h - 2]; f = k(f, 17) ^ k(f, 19) ^ f >>> 10; f = e(f, n[h - 7]); var u = n[h - 15]; u = k(u, 7) ^ k(u, 18) ^ u >>> 3; f = e(e(f, u), n[h - 16]) } n[l] = f; l = q; l = k(l, 6) ^ k(l, 11) ^ k(l, 25); l = e(e(e(e(m, l), q & w ^ ~q & x), d[h]), n[h]); m = p; m = k(m, 2) ^ k(m, 13) ^ k(m, 22); f = e(m, p & r ^ p & t ^ r & t); m = x; x = w; w = q; q = e(z, l); z = t; t = r; r = p; p = e(l, f) } a[0] = e(p, a[0]); a[1] = e(r, a[1]); a[2] = e(t, a[2]); a[3] = e(z, a[3]); a[4] = e(q, a[4]); a[5] = e(w, a[5]); a[6] = e(x, a[6]); a[7] = e(m, a[7])
            } return a
    }(function (c) {
        //@ts-ignore
        for (var b = [], d = 0; d < 8 * c.length; d += 8) {
            //@ts-ignore
            b[d >> 5] |= (c.charCodeAt(d / 8) & 255) << 24 - d % 32;
        }
        //@ts-ignore
        return b;
    }(v), 8 * v.length))
};
