/*
   This script calculates how many addresses can be inferred from Open Addresses
   UK's dataset by using simple, house number-based inference.

   The algorithm we plan to use for inference generates all possible house
   numbers for knowns streets, based on the following assumptions:
   a) If two addresses belong to the same street and postcode, all other
      house numbers betweeen those addresses' house numbers belong to the same
      street and postcode, too.
   b) If all known house numbers in the same street and postcode are even, it is
      likely that most of the missing even numbers between the min and max of the
      known house numbers exist, too.
   c) As for (b) but for odd numbers.
   d) If both odd and even numbers can be found within the known house numbers in
      the same street and postcode, it is likely that most of the missing numbers
      between the the min and max of the known house numbers exist, too.

  To run this script, unzip the data only, split by postcode sector version
  of Open Addresses UK's data in the 'data' folder.
*/

var async = require("async"),
    csv = require("csv"),
    fs = require("fs-extra"),
    path = require("path"),
    _ = require("underscore");

var getListOfOAFiles = function (folder, callback) {
    var sectorFilenames = fs.readdirSync(folder)
        .filter(function (sectorFilename) {
            return fs.statSync(path.join(__dirname, "data", sectorFilename)).isFile();
        })
        .filter(function (sectorFilename) {
            return sectorFilename.match(/^[A-Z]*.csv/);
        })
        .map(function (sectorFilename) {
            return path.join(__dirname, "data", sectorFilename);
        });
    callback(null, sectorFilenames);
}

var allEven = function (a) {
    return _.every(a, function (x) { return x % 2 === 0; });
};

var allOdd = function (a) {
    return _.every(a, function (x) { return x % 2 === 1; });
};

var howManyInferable = function (sectorFilename, callback) {
    var data = { };
    csv()
        .from.stream(fs.createReadStream(sectorFilename), { 'columns': true })
        .to.array(function(temp) {
            temp.forEach(function (x) {
                // note how I avoid PAOs and SAOs starting with zero,
                // see https://github.com/OpenAddressesUK/forum/issues/40
                var houseNumber = x.pao && x.pao.match(/^([1-9]\d*)/) ?
                        parseInt(x.pao.match(/^([1-9]\d*)/)[1]) :
                        x.sao && x.sao.match(/^([1-9]\d*)/) ?
                            parseInt(x.sao.match(/^([1-9]\d*)/)[1]) :
                            null;
                if (houseNumber) data[x["postcode.url"] + "_" + x["street.url"]] = data[x["postcode.url"] + "_" + x["street.url"]] ? _.uniq(data[x["postcode.url"] + "_" + x["street.url"]].concat(houseNumber)).sort() : [ houseNumber ];
            });
            var noOfInferable = _.keys(data).reduce(function (memo, key) {
                var inferable = [ ];
                // the check below is a failsafe, see
                // https://github.com/OpenAddressesUK/forum/issues/40
                if (Math.max.apply(null, data[key]) / Math.min.apply(null, data[key]) < 2000) {
                    inferable = _.difference(
                        // all inferable house numbers, including the ones we know already
                        _.range(
                            Math.min.apply(null, data[key]) + 1,
                            Math.max.apply(null, data[key]),
                            allEven(data[key]) || allOdd(data[key]) ? 2 : 1
                        ),
                        // the known house numbers
                        data[key]
                    );
                }
                return memo + inferable.length;
            }, 0);
            var noOfKnownAddresses = _.keys(data).reduce(function (memo, key) { return memo + data[key].length; }, 0);
            console.log(sectorFilename, noOfKnownAddresses, noOfInferable, noOfKnownAddresses < 1 ? "" : "+" + Math.round(((noOfInferable + noOfKnownAddresses) / noOfKnownAddresses - 1) * 100) + "%");
            callback(null, noOfInferable);
        });
};

getListOfOAFiles(path.join(__dirname, "data"), function (err, sectorFilenames) {
    async.reduce(sectorFilenames, 0, function (memo, sectorFilename, callback) {
        howManyInferable(sectorFilename, function (err, noOfInferable) {
            callback(null, memo + noOfInferable);
        });
    }, function (err, result) {
        console.log("Total inferred: " + result);
    });
});
