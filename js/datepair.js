/*jshint jquery:true */

/** Utility for correlated start / end date time selectors.
 *
 * Currently assumes fields coming from two external picker utilities:
 * - http://www.eyecon.ro/bootstrap-datepicker
 * - http://jonthornton.github.io/jquery-timepicker/
 */

var DatePair = function (shouldSetToNow, dateTimeObjects) {

    /** DOM state used by DatePair.
     *
     * DatePair sits upon a boot strap date picker and a JQuery time
     * picker. Start and end versions of these pickers provide the UI
     * for the user and contain all data.
     *
     */

    //Check If start and end dateTime jQuery Objects were passed in
    if(dateTimeObjects) {
        this.startDate = dateTimeObjects.dateStart;
        this.endDate = dateTimeObjects.dateEnd;
        this.startTime = dateTimeObjects.timeStart;
        this.endTime = dateTimeObjects.timeEnd;
    } else {
        this.startDate = $('.dt_date_start').last();
        this.endDate = $('.dt_date_end').last();
        this.startTime = $('.dt_time_start').last();
        this.endTime = $('.dt_time_end').last();
    }

    this.priorTimeDelta = NaN;

    /** Hook logic into DOM and optionally set initial date time data.
     */
    this.initialize = function (shouldSetToNow) {

        // Fix bug with the way Bootstrap overlays carets
        $('.caret, .arrow_down').on('click', function() {
            $(this).siblings().trigger('click');
        });

        // Associate DatePair with elements on page.
        this.hookUpWidgets();

        // Optionally now.
        if (shouldSetToNow) {
            this.setToNow();
        }
        // Finally, kick the update logic once.
        this.verifyStartEnd();
    };

    /** Set entry time to now with a duration of one hour.
     */
    this.setToNow = function () {
        var now,
            inOneHour,
            quarterHours,
            rounded;
        // Calculate 'now' to the nearest quarter hour
        now = new Date();
        quarterHours = Math.round(now.getMinutes() / 15);
        if (quarterHours === 4) {
            now.setHours(now.getHours() + 1);
        }
        rounded = (quarterHours * 15) % 60;
        now.setMinutes(rounded);
        // Calculate one hour from 'now'
        inOneHour = new Date(now.getTime() +  this.oneHourMS);
        // Update widget state
        this.setStartDateTime(now);
        this.setEndDateTime(inOneHour);
    };

    /** Utility configuring widgets associated with DOM elements.
     */
    this.hookUpWidgets = function () {
        var thisDatePair = this;

        // Starti date and time
        this.startDate.datepicker({
            'autoclose': true,
            'todayBtn': true,
            'todayHighlight': true,
            'startDate': '+0d',
            'endDate': '+2m'
        }).change(function () {
            thisDatePair.updateEndTime(thisDatePair.priorTimeDelta);
            thisDatePair.verifyStartEnd();    // Update text box
            thisDatePair.startTime[0].focus();    // Highlight time stamp
        });
        this.startTime.timepicker({
            'timeFormat': 'g:ia',
            'scrollDefaultNow': true
        }).change(function () {
            thisDatePair.updateEndTime(thisDatePair.priorTimeDelta);
            thisDatePair.verifyStartEnd();    // Update text box
        });

        // End date and time
        this.endDate.datepicker({
            'autoclose': true,
            'startDate': '+0d',
            'endDate': '+2m'
        }).change(function () {
            thisDatePair.verifyStartEnd();   // Update text box
            thisDatePair.priorTimeDelta = thisDatePair.getTimeDelta();
            thisDatePair.updateEndTime(thisDatePair.priorTimeDelta);
            thisDatePair.endTime[0].focus();    // Highlight time stamp
        }).data('datepicker');
        this.endTime.timepicker({
            'timeFormat': 'g:ia',
            'scrollDefaultNow': true
        }).change(function () {
            thisDatePair.priorTimeDelta = thisDatePair.getTimeDelta();
            thisDatePair.updateEndTime(thisDatePair.priorTimeDelta);
            thisDatePair.verifyStartEnd();    // Update text box
        });
    };

    /** Adjust end time to maintain constant timeDelta from start time.
     *
     * Expected behavior of the DatePair widget is that a change to the
     * start time will result in a modified end time such that the
     * timeDelta between start and end remains constant.
     *
     * @param {number} Time delta in seconds that should exist between
     * start and end date time.
     */
    this.updateEndTime = function (timeDelta) {
        var startSeconds,
            endDateTime;
        if (isNaN(timeDelta) || timeDelta <= 0) {
            timeDelta = this.oneHourMS / 1000;
        }
        endDateTime = new Date(
                this.getStartDateTime().getTime() +
                timeDelta * 1000);
        this.setEndDateTime(endDateTime);
        // If time delta is less than one day then show duration in
        // end time picker, else use a minimal display.
        if (timeDelta < (this.oneHourMS * 24 / 1000)) {
            startSeconds = this.startTime.timepicker('getSecondsFromMidnight');
            this.endTime.timepicker('option', 'minTime', startSeconds + 30 * 60);
            this.endTime.timepicker('option', 'maxTime', '12:00pm');
            this.endTime.timepicker('option', 'durationTime', startSeconds);
            this.endTime.timepicker('option', 'showDuration', true);
        } else {
            this.endTime.timepicker('option', 'minTime', null);
            this.endTime.timepicker('option', 'maxTime', null);
            this.endTime.timepicker('option', 'showDuration', false);
        }
    };

    /** Calculate time delta between start and end date times.
     *
     * @returns {number|NaN} Time delta in seconds.  Return NaN if one
     * of start or end date is not well defined.
     */
    this.getTimeDelta = function () {
        var datetimeDelta;
        // Determine the datetime delta
        datetimeDelta = (this.getEndDateTime() - this.getStartDateTime()) / 1000;
        return datetimeDelta;
    };

    /** Accessor to get the start Date object.
     *
     * returns {Date} Date and time of start.
     */
    this.getStartDateTime = function () {
        var date,
            startDate,
            startSeconds;
        startDate = new Date(this.startDate.val());
        startSeconds = this.startTime.timepicker('getSecondsFromMidnight');
        date = new Date(startDate.getTime() + startSeconds * 1000);
        return date;
    };

    /** Accessor to get the end Date object.
     *
     * returns {Date} Date and time of end.
     */
    this.getEndDateTime = function () {
        var date,
            endDate,
            endSeconds;
        endDate = new Date(this.endDate.val());
        endSeconds = this.endTime.timepicker('getSecondsFromMidnight');
        date = new Date(endDate.getTime()  + endSeconds * 1000);
        return date;
    };

    /** Set the start data from Date object.
     *
     * param {Date} Start Date object.
     */
    this.setStartDateTime = function (date) {
        var startDate;

        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Check for NaN.. should be logging an error here
        if (isNaN(startDate)) {
            return;
        }

        this.startDate.data('datepicker').setDate(startDate);
        this.startTime.timepicker('setTime', date);
    };

    /** Set the end data from Date object.
     *
     * param {Date} End Date object.
     */
    this.setEndDateTime = function (date) {
        var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        //if end time is 11:30pm, change end date to start date
        if((date.getHours() + ":" + date.getMinutes()) ==  "23:30"
            && this.getTimeDelta() < (this.oneHourMS * 24)) {
            endDate.setDate(this.getStartDateTime().getDate());
        }

        // Check for NaN.. should be logging an error here
        if (isNaN(endDate)) {
            return;
        }

        this.endDate.data('datepicker').setDate(endDate);
        this.endTime.timepicker('setTime', date);
        this.priorTimeDelta = this.getTimeDelta();
    };

    /** Force end date time to be after start date time.
     */
    this.verifyStartEnd = function () {
        var timeDelta;
        timeDelta = this.getTimeDelta();
        // Nothing to do if timeDelta is NaN.
        if (isNaN(timeDelta)) {
            return;
        }
        // Start must be before end.  If not then shift end.
        if (timeDelta <= 0) {
            timeDelta = this.oneHourMS / 1000;
            this.updateEndTime(timeDelta);
        }
        this.displayDuration(timeDelta * 1000);
    };

    /** Enables the datepairs and increases the opacity
     */
    this.enable = function () {
        // Enable date / time entry
        this.startDate.prop('disabled', false);
        this.endDate.prop('disabled', false);
        this.startTime.prop('disabled', false);
        this.endTime.prop('disabled', false);
        this.startDate.fadeTo('fast', 1.0);
        this.endDate.fadeTo('fast', 1.0);
        this.startTime.fadeTo('fast', 1.0);
        this.endTime.fadeTo('fast', 1.0);
    };

    /** Disables the datepairs and decreases the opacity
     */
    this.disable = function () {
        // Disable date / time entry
        this.startDate.prop('disabled', true);
        this.endDate.prop('disabled', true);
        this.startTime.prop('disabled', true);
        this.endTime.prop('disabled', true);
        this.startDate.fadeTo('fast', 0.5);
        this.endDate.fadeTo('fast', 0.5);
        this.startTime.fadeTo('fast', 0.5);
        this.endTime.fadeTo('fast', 0.5);
    };

    this.setTimeCookie = function () {
        var configurations,
            timeCookie;
        configurations = {
            path: '/',        // set globally for the site
            expires: 1        // one hour expiration
        };
        timeCookie = {
            startDateTime: this.getStartDateTime(),
            endDateTime: this.getEndDateTime()
        };
        $.cookie.json = true;
        $.cookie('parkme_timecookie', timeCookie, configurations);
    };

    this.displayDuration = function (datetimeDelta) {
        var dateTimeDeltaMinutes = datetimeDelta/(this.oneHourMS/60),
            dateString,
            hourString,
            minuteString;

        dateInt = Math.floor(dateTimeDeltaMinutes / (60 * 24));
        dateString = dateInt + ' days';
        dateString = (dateString === '1 days') ? '1 day': dateString;
        dateString = (dateString === '0 days') ? '': dateString;
        dateTimeDeltaMinutes -= (dateInt * (60 * 24));

        hourInt = Math.floor(dateTimeDeltaMinutes / 60);
        hourString = hourInt + ' hours';
        hourString = (hourString === '1 hours') ? '1 hour': hourString;
        hourString = (hourString === '0 hours') ? '': hourString;
        dateTimeDeltaMinutes -= (hourInt * 60);

        minuteString = dateTimeDeltaMinutes + ' minutes';
        minuteString = (minuteString === '1 minutes') ? '1 minute': minuteString;
        minuteString = (minuteString === '0 minutes') ? '': minuteString;

        $('.output-duration').text(dateString + ' ' + hourString + ' ' + minuteString);
    };

    this.oneHourMS = 60 * 60 * 1000;  // one hour in ms

    // constructor
    return (function (thisDatePair) {
        thisDatePair.initialize(shouldSetToNow);
        return thisDatePair;
    }(this));
};

// Initialize on load
$(function() {
    var datePair = new DatePair(true);
});
