document.querySelector('#email').addEventListener('keyup', showTest);
document.querySelector('#email').addEventListener('click', showTest);
document.querySelector('#email').addEventListener('paste', showTest);
document.querySelector('#email').addEventListener('blur', showTest);
document.querySelector('#email').addEventListener('focus', showTest);

var filter = null;
(function() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        filter = new Uint8Array(xhr.response);
        showTest();
    };
    xhr.open('get', 'filter.bloom', true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
    showTest();
}());

function showTest() {
    document.querySelector('#output').innerHTML = test(this.value);
}

function test(email) {
   if (!filter)
       return '<i>...loading...</i>';
    if (!email || email.length < 6)
        return '<i>Enter e-mail address</i>';
    var k = filter[0];
    var result = 1;
    for (var i = 0; i < k; i++) {
        var n = email.fletcher32(i) & (((filter.length - 1) * 8) - 1);
        result &= filter[Math.floor(n / 8) + 1] >> (n % 8);
    }
    return result === 0 ?
        'This address is unlisted.' :
        '<span class="warn">This address was <b>leaked</b>!</span>';
}

var SEEDS = [
    0xd03a, 0xf805, 0x40f9, 0xb993, 0xab36, 0x96b7, 0xe9e3, 0x6787, 0xa1af,
    0x1b0d, 0x6b0b, 0x35f1, 0x8820, 0x24f8, 0x4895, 0xd7f1, 0xe773, 0x66ce,
    0x8830, 0x74a7, 0x71d6, 0x3c07, 0x9fea, 0x721b, 0xf350, 0x9da3, 0x6309,
    0x0596, 0x62dc, 0x11bf, 0x3aef, 0x86d4, 0xac08, 0xa350, 0x9a1c, 0xced5,
];

String.prototype.fletcher32 = function(n) {
    var sum1 = SEEDS[n * 2], sum2 = SEEDS[n * 2 + 1];
    var length = Math.ceil(this.length / 2);
    var i = 0;
    while (length) {
        var tlen = length > 360 ? 360 : length;
        length -= tlen;
        do {
            sum1 += (this.charCodeAt(i + 1) << 8) | this.charCodeAt(i);
            sum2 += sum1;
            i += 2;
        } while (--tlen);
        sum1 = (sum1 & 0xffff) + (sum1 >> 16);
        sum2 = (sum2 & 0xffff) + (sum2 >> 16);
    }
    sum1 = (sum1 & 0xffff) + (sum1 >> 16);
    sum2 = (sum2 & 0xffff) + (sum2 >> 16);
    return (sum2 << 16 | sum1) >>> 0;
};
