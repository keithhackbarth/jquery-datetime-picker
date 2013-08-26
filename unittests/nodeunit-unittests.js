/*jshint evil:true */
/*global module, require, DatePair */

var fs = require('fs');
// Some of the plugins use jQuery var instead of $
var jQuery = require('jquery');
var $ = jQuery;

// Recreate window and document
var window = { jQuery: jQuery };
var document = window;

// file is included here:
eval(fs.readFileSync('../lib/js/jquery/plugins/jquery.cookie.js') + '');
eval(fs.readFileSync('../lib/js/jquery.timepicker/jquery.timepicker.js') + '');
eval(fs.readFileSync('../lib/js/bootstrap/bootstrap-datepicker.js') + '');
eval(fs.readFileSync('../homepage/js/datepair.js') + '');

// Initialize DatePair Object
var datePair = DatePair(new Date(), {
    dateStart: $('<input type="text" autocomplete="off">'),
    dateEnd: $('<input type="text" autocomplete="off">'),
    timeStart: $('<input type="text" autocomplete="off">'),
    timeEnd: $('<input type="text" autocomplete="off">')
});

module.exports = {
    'Time Delta Var Is 1 hour' : function (test) {
        test.equal(datePair.getTimeDelta(), 3600);
        test.done();
    },
    'Change Date And Check For 1 Hour Difference' : function (test) {
        datePair.startTime.val("10:00pm").change();
        test.equal(datePair.endTime.val(), "11:00pm");
        test.done();
    },
    'Make End Date Move Up One Day' : function (test) {
        datePair.startTime.val("11:00pm").change();
        test.equal(parseInt(datePair.endDate.val().split("/")[1]), parseInt(datePair.startDate.val().split("/")[1]) + 1);
        test.equal(datePair.endTime.val(), "12:00am");
        test.done();
    },
    'Change To 11:30pm Of Previous Day' : function (test) {
        //Move EndDate 1 Day Forward
        datePair.startTime.val("11:00pm").change();

        //Move EndDate 1 Day Backwards
        datePair.endTime.val("11:30pm").change();
        test.equal(datePair.endDate.val(), datePair.startDate.val());
        test.done();
    }
}
