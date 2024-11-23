function loop(arr, callback) {
    var type = typeof (arr)
    switch (type) {
        case 'number':
            for (var nr = 0; nr < arr; nr++) {
                if (callback(nr) === false) break
            }
            break
        case 'object':
        case 'string':
            if (arr != null) {
                if (arr.length != undefined) {
                    for (var nr = 0; nr < arr.length; nr++) {
                        if (arr.hasOwnProperty(nr)) {
                            if (callback(nr, arr[nr]) === false) break
                        }
                    }
                } else {

                    var count = 0
                    for (var nr in arr) {
                        if (arr.hasOwnProperty(nr)) {
                            if (callback(nr, arr[nr], count) === false) break
                            count += 1
                        }
                    }
                }
            }
            break
    }
}
function guid() {
    return crypto.randomUUID()
}
function getfunctionname(string) {
    string = string.toString()
    string = string.split('function ')[1]
    string = string.split('(')[0] + '_'
    return string
}
Number.prototype.round = function (prec) {
    var isnegative = false,
        value = this * 1
    if (this < 0) {
        value = this * -1
        isnegative = true
    }
    if (prec) {
        var pow = Math.pow(10, 14),
            res = Math.round(value * pow) / pow;

        pow = Math.pow(10, prec)

        //check if number has already e inside it 
        if ((res + 'a').indexOf('e') == -1) {
            res = Number(Math.round(res + "e+" + prec) + "e-" + prec)
        } else {
            res = Math.round(res * pow) / pow;
        }

    } else {
        res = Math.round(value)
    }
    if (isnegative) {
        res = -res
    }
    return res
}
Number.prototype.tofloat = function () {
    return this.valueOf()
}
String.prototype.tofloat = function (rounding) {
    if (this == '') return 0
    var val = this.toString().nospace()
    val = val.replace(',', '.')
    val = parseFloat(val)
    if (rounding) {
        val = val.round(rounding)
    }
    return val
}
String.prototype.round = function (rounding) {
    return this.tofloat(rounding)
}
String.prototype.toint = function () {
    return parseInt(this.toString())
}
Object.defineProperty(Array.prototype, "first", {
    get: function () {
        return this[0];
    }
})
Object.defineProperty(Array.prototype, "last", {
    get: function () {
        return this[this.length - 1];
    }
})
Array.prototype.getbyid = function (id) {
    let o = this.filter(function (p) {
        return p.id == id
    })[0]
    return o
}
Date.prototype.toISO = function () {

    return this.getFullYear() + '-' + (this.getMonth()+1) + '-' + this.getDate()
}