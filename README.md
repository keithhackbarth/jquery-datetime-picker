Datetime Picker Plugin for jQuery/Bootstrap
========================

[<img src="http://jonthornton.github.com/jquery-timepicker/lib/screenshot.png" alt="datetime picker screenshot" />]

Description
-----------

I wanted a date time picker similar to the one found on kayak.com.  I scoured the web looking for one when finally I can across the the example given in Jon Thorton's timepicker.

However, at the time of downloading the example had falling out of sync with the dependant libraies.  Plus, I wanted to extend it a little bit farther.  For example, I didn't want dates to overlap, or start dates to be before end dates, or durations to show when greater than 24 hours, etc..  So I eventually decided to fork and here we are.

Requirements
------------
* [jQuery](http://jquery.com/) (>= 1.7)
* [Bootstrap](http://twitter.github.com/bootstrap/) 2.0.4+
* [jquery-timepicker](https://github.com/jonthornton/jquery-timepicker)
* [bootstrap-datepicker](https://github.com/eternicode/bootstrap-datepicker)

Installation
------------
See the index.html

```
<p class="datepair" data-language="javascript">
	<input type="text" class="dates start" />
	<input type="text" class="time start" /> to
	<input type="text" class="dates end" />
	<input type="text" class="time end" />
</p>
```
