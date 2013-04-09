/* jQuery:true */

$(function () {
    var checkin,
        checkout,
        now,
        quarterHours,
        inOneHour;

    // Calculate 'now' to the nearest quarter hour
    now = new Date();
    quarterHours = Math.round(now.getMinutes() / 15);
    if (quarterHours === 4)
    {
        now.setHours(now.getHours() + 1);
    }
    var rounded = (quarterHours * 15) % 60;
    now.setMinutes(rounded);

    // Calcualte one hour from 'now'
    inOneHour = new Date(now.getTime() + 60 * 60 * 1000); /* ms */

    // Initialize Date Picker -- Check In
    checkin = $('.dates.start').datepicker({
        'autoclose': true,
        'todayBtn': true,
        'todayHighlight': true
    }).on('changeDate', function (ev) {

        // If Start Date > End Date, then update end date
        var nowUTC = new Date(
            ev.date.getUTCFullYear(),
            ev.date.getUTCMonth(),
            ev.date.getUTCDate(),  0, 0, 0);
        if (ev.date > checkout.date) {
            checkout.setDate(nowUTC);
            checkout.setStartDate(this.value);
        }

        updateDateTime($(this));        // Update text box
        $('.time.start')[0].focus();    // Highlight time stamp
    }).data('datepicker');
    checkin.setDate(now);
    checkin.setStartDate(now);

    // Initialize Date Picker -- Check Out
    checkout = $('.dates.end').datepicker({
        'autoclose': true
    }).on('changeDate', function () {
        updateDateTime($(this));      // Update text box
        $('.time.end')[0].focus();    // Highlight time stamp
    }).data('datepicker');
    checkout.setStartDate('+0d');
    checkout.setDate(inOneHour);

    // Initialiaze Time Picker -- Check In
    $('.time.start').timepicker({
        'timeFormat': 'g:ia',
        'scrollDefaultNow': true
    }).on('changeTime', function () {
        updateDateTime($(this));
    }).timepicker('setTime', now);

    // Initialiaze Time Picker -- Check In
    $('.time.end').timepicker({
        'timeFormat': 'g:ia',
        'scrollDefaultNow': true
    }).on('changeTime', function () {
        updateDateTime($(this));
    }).timepicker('setTime', inOneHour);


    // Finally, kick the update logic once
    updateDateTime($('.dates.end'));

});

var updateDateTime = function (target) {
    var container,
      start,
      end,
      startInt,
      endInt,
      startTime,
      endTime,
      datetimeDelta,
      dateString,
      timeString;

    // Empty chcek
    if (!target.val()) {
        return;
    }

    // Initialize all the function variables
    container = target.closest('.datepair');
    start = container.find('input.start.time');
    end = container.find('input.end.time');
    startInt = start.timepicker('getSecondsFromMidnight');
    endInt = end.timepicker('getSecondsFromMidnight');

    // Determine the datetime delta
    startTime = new Date($('.dates.start').val()).getTime() + startInt * 1000;
    endTime = new Date($('.dates.end').val()).getTime() + endInt * 1000;
    datetimeDelta = endTime - startTime;

    // Date Delta Logic
    dateString = (datetimeDelta / 86400000).toFixed(0) + ' days ';

    // Time Delta Logic
    if (datetimeDelta <= 0) {
        //
        end.timepicker('setTime', new Date(start.timepicker('getTime').getTime() + 15 * 60000));
        updateDateTime($('.dates.end'));
        return;
    } else if (datetimeDelta < 86400000) {
        end.timepicker('option', 'minTime', startInt + 30 * 60); // 30 min from start time
        end.timepicker('option', 'durationTime', startInt);
        end.timepicker('option', 'showDuration', true);
    } else {
        end.timepicker('option', 'minTime', null);
        end.timepicker('option', 'showDuration', false);
    }

    timeString = ((datetimeDelta % 86400000) / 3600000).toFixed(1) + ' hours';

    $('.output-duration').text(dateString + timeString);
};
