var async = require("async"),
    csv = require("csv"),
    fs = require("fs-extra"),
    path = require("path"),
    _ = require("underscore");

var allEven = function (a) {
    return _.every(a, function (x) {
        return x % 2 === 0;
    });
};

var allOdd = function (a) {
    return _.every(a, function (x) {
        return x % 2 === 1;
    });
};

var howManyInferable = function (sectorFilename, callback) {
    var data = { };
    csv()
        .from.stream(fs.createReadStream(sectorFilename), { 'columns': true })
        .to.array(function(temp) {
            temp.forEach(function (x) {
                // note how I avoid PAOs and SAOs starting by zero,
                // see https://github.com/OpenAddressesUK/forum/issues/40
                var houseNumber = x.pao && x.pao.match(/^([1-9]\d*)/) ? parseInt(x.pao.match(/^([1-9]\d*)/)[1]) : x.sao && x.sao.match(/^([1-9]\d*)/) ? parseInt(x.sao.match(/^([1-9]\d*)/)[1]) : null;
                if (houseNumber) data[x["postcode.url"] + "_" + x["street.url"]] = data[x["postcode.url"] + "_" + x["street.url"]] ? _.uniq(data[x["postcode.url"] + "_" + x["street.url"]].concat(houseNumber)).sort() : [ houseNumber ];
            });
            var noOfInferable = _.keys(data).reduce(function (memo, key) {
                var inferable = [ ];
                // the check below is a failsafe, see
                // https://github.com/OpenAddressesUK/forum/issues/40
                if (Math.max.apply(null, data[key]) / Math.min.apply(null, data[key]) < 2000) {
                    inferable = _.difference(
                        // all inferable house numbers, including the ones we know already
                        _.range(Math.min.apply(null, data[key]) + 1, Math.max.apply(null, data[key]), allEven(data[key]) || allOdd(data[key]) ? 2 : 1),
                        // the known house numbers
                        data[key]
                    );
                }
                return memo + inferable.length;
            }, 0);
            callback(null, noOfInferable);
        });
};

var sectorFilenames = fs.readdirSync(path.join(__dirname, "data"))
    .filter(function (sectorFilename) {
        return fs.statSync(path.join(__dirname, "data", sectorFilename)).isFile();
    })
    .filter(function (sectorFilename) {
        return sectorFilename.match(/^[A-Z]*.csv/);
    })
    .map(function (sectorFilename) {
        return path.join(__dirname, "data", sectorFilename);
    });
async.reduce(sectorFilenames, 0, function (memo, sectorFilename, callback) {
    console.log(sectorFilename);
    howManyInferable(sectorFilename, function (err, noOfInferable) {
        callback(null, memo + noOfInferable);
    });
}, function (err, result) {
    console.log(result);
});
