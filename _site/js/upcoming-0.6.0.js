/*jslint white: false, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
/*global window */
/*
 * Upcoming.js
 * (c) 2009 Kyle Adams <kyleandkelly.com>
 * MIT license
 *
 * array.js
 *
 * Ensure various array functions are uniformly implemented
 * across browsers.
 */
"use strict";

// Make sure an Array.map function is implemented, per
// https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Objects/Array/Map
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0,
            res = new Array(len),
            thisp = arguments[1];
            
        if (typeof fun !== "function") {
            throw new TypeError();
        }
        
        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(thisp, this[i], i, this);
            }
        }
        
        return res;
    };
}

// Make sure an Array.forEach function is implemented, per
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fun /*, thisp*/) {
        var len = this.length >>> 0,
            thisp = arguments[1];
        
        if (typeof fun !== "function") {
            throw new TypeError();
        }
        
        for (var i = 0; i < len; i++) {
            if (i in this) {
                fun.call(thisp, this[i], i, this);
            }
        }
    };
}

// Make sure an Array.filter function is implemented, per
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Array/filter
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp*/) {
        var len = this.length >>> 0,
            res = [],
            thisp = arguments[1],
            val;
        
        if (typeof fun !== "function") {
            throw new TypeError();
        }
        
        for (var i = 0; i < len; i++) {
            if (i in this) {
                val = this[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, this)) {
                    res.push(val);
                }
            }
        }
        
        return res;
    };
}
/*jslint white: false, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
/*global window,upcomingjs */
/*
 * Upcoming.js
 * (c) 2010 Kyle Adams <kyleandkelly.com>
 * MIT license
 *
 * dates.js
 *
 * Various date-related functions.
 */

"use strict";

/* Namespace */
window.upcomingjs = window.upcomingjs || {};

upcomingjs.Dates = (function() {
    var token = (/d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloOSZ]|"[^"]*"|'[^']*'/g),
        timezone = (/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g),
        timezoneClip = (/[^-+\dA-Z]/g),
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) { val = "0" + val; }
            return val;
        };

    return {
        /*
         * Date Format 1.2.3
         * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
         * MIT license
         *
         * Includes enhancements by Scott Trenda <scott.trenda.net>
         * and Kris Kowal <cixar.com/~kris.kowal/>
         *
         * Modified by Kyle Adams <kyleandkelly.com> for use in Upcoming.js
         *
         * Accepts a date, a mask, or a date and a mask.
         * Returns a formatted version of the given date.
         * The date defaults to the current date/time.
         * The mask defaults to dateFormat.masks.default.
         */
        format: function (date, mask, utc) {
            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !(/\d/).test(date)) {
                mask = date;
                date = undefined;
            }
    
            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) { throw SyntaxError("invalid date"); }
    
            mask = String(this.masks[mask] || mask || this.masks["default"]);
    
            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }
    
            var    _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  this.i18n.dayNames[D],
                    dddd: this.i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  this.i18n.monthNames[m],
                    mmmm: this.i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? "a"  : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A"  : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    O:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60), 2) + ":" + pad(Math.abs(o) % 60, 2),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };
    
            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        },
        
        // Some common format strings
        masks: {
            "default":      "ddd mmm dd yyyy HH:MM:ss",
            shortDate:      "m/d/yy",
            mediumDate:     "mmm d, yyyy",
            longDate:       "mmmm d, yyyy",
            fullDate:       "dddd, mmmm d, yyyy",
            shortTime:      "h:MM TT",
            mediumTime:     "h:MM:ss TT",
            longTime:       "h:MM:ss TT Z",
            isoDate:        "yyyy-mm-dd",
            isoTime:        "HH:MM:ss",
            isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
            isoDateTimeO:    "yyyy-mm-dd'T'HH:MM:ssO",
            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        },
        
        // Internationalization strings
        i18n: {
            dayNames: [
                "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
            ],
            monthNames: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ],
            dayHeader: "dddd, mmmm dS",
            nanoTime: "htt",
            tinyTime: "h:MMtt"
        },
        
        zeroTimestamp: function(date) {
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        },
        
        // Taken from http://delete.me.uk/2005/03/iso8601.html
        isoString: function(string) {
            var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
                "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
                "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?",
                d = string.match(new RegExp(regexp)),
                offset = 0,
                date = new Date(d[1], 0, 1),
                offsetDate = new Date();
        
            if (d[3]) { date.setMonth(d[3] - 1); }
            if (d[5]) { date.setDate(d[5]); }
            if (d[7]) { date.setHours(d[7]); }
            if (d[8]) { date.setMinutes(d[8]); }
            if (d[10]) { date.setSeconds(d[10]); }
            if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
            if (d[14]) {
                offset = (Number(d[16]) * 60) + Number(d[17]);
                offset *= ((d[15] == '-') ? 1 : -1);
            }
        
            offset -= date.getTimezoneOffset();
            time = (Number(date) + (offset * 60 * 1000));
            offsetDate.setTime(Number(time));
            
            return offsetDate;
        }
    };
}());
/*jslint white: false, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, evil: true */
/*global window,upcomingjs */
/*
 * Simple JavaScript Templating
 * John Resig - http://ejohn.org/ - MIT Licensed
 * http://ejohn.org/blog/javascript-micro-templating/
 *
 * Modified by Kyle Adams <kyleandkelly.com> for use in Upcoming.js
 */
"use strict";

/* Namespace */
window.upcomingjs = window.upcomingjs || {};

upcomingjs.Tmpl = (function() {
    var cache = {};
    
    return {
        render: function(str, data){
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !(/\W/).test(str) ?
                cache[str] = cache[str] ||
                    this.render(document.getElementById(str).innerHTML) :
            
                // Generate a reusable function that will serve as a template
                // generator (and which will be cached).
                new Function("obj",
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    
                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +
            
                    // Convert the template into pure JavaScript
                    str
                        .replace(/[\r\t\n]/g, " ")
                        .split("<%").join("\t")
                        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                        .replace(/\t=(.*?)%>/g, "',$1,'")
                        .split("\t").join("');")
                        .split("%>").join("p.push('")
                        .split("\r").join("\\'") + 
                    
                    "');}return p.join('');"
                );
            
            // Provide some basic currying to the user
            return data ? fn( data ) : fn;
        }
    };
}()); 
/*jslint white: false, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, forin: true */
/*global window,upcomingjs */
/*
 * Upcoming.js
 * (c) 2010 Kyle Adams <kyleandkelly.com>
 * MIT license
 *
 * util.js
 *
 * Utility functions for the Upcoming.js library.
 */
"use strict";

/* Namespace */
window.upcomingjs = window.upcomingjs || {};

upcomingjs.Util = function() {
};

upcomingjs.Util.extend = function(o1, o2) {
    /**
     * Set the options if provided any.
     * Taken from MooTools
     */
    if (o2 && o2 != 'undefined') {
        for (var o in o2) {
            if (o2[o] && o2[o] != 'undefined') {
                o1[o] = o2[o];
            }
        }
    }
};
/*jslint white: false, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
/*global window,upcomingjs */
/*
 * Upcoming.js
 * (c) 2010 Kyle Adams <kyleandkelly.com>
 * MIT license
 *
 * events.js
 *
 * Processes the results of querying a Google calendar
 * into the JSON equivalent of the vevent microformat and
 * renders the data via a template.
 */
"use strict";

/* Namespace */
window.upcomingjs = window.upcomingjs || {};

upcomingjs.Events = (function() {
    var t = upcomingjs.Tmpl,
        u = upcomingjs.Util,
        d = upcomingjs.Dates,
        o = {
            period: 7,
            element: 'upcomingjs',
            orderby: 'starttime',
            sortorder: 'ascending',
            spinner: '<em>Loading&#8230;</em>',
            show: null, // function used to animate showing the events
            error: function(e) {
                var msg = 'Unable to display the upcoming events due to an error.';
                this.element.innerHTML = '<span class="error">' + msg + '</span>';
                if (window.console) {
                    console.error(msg + '\n\n' + (e.cause ? e.cause.statusText : e.message));
                }
            },
            tmpl: ' \
                <table class="vcalendar"> \
                    <thead> \
                        <tr> \
                            <th id="event-date">Date</th> \
                            <th id="event-info">Info</th> \
                        </tr> \
                    </thead> \
                    <tbody> \
                        <% if (!days.length) { %> \
                        <tr> \
                            <td colspan="2">No upcoming events found.</td> \
                        </tr> \
                        <% } else { %> \
                        <% var d = upcomingjs.Dates; %> \
                        <% for (var i = 0; i < days.length; i++) { %> \
                        <% var day = days[i]; %> \
                        <tr> \
                            <th colspan="2"> \
                                <%=d.format(day.date, d.i18n.dayHeader)%> \
                            </th> \
                        </tr> \
                        <% for (var j = 0; j < day.events.length; j++) { %> \
                        <% var event = day.events[j]; %> \
                        <% var start = d.format(event.dtstart, (event.dtstart.getMinutes() === 0 ? d.i18n.nanoTime : d.i18n.tinyTime)); %> \
                        <% var end = d.format(event.dtend, (event.dtend.getMinutes() === 0 ? d.i18n.nanoTime : d.i18n.tinyTime)); %> \
                        <tr class="vevent"> \
                            <td headers="event-date"> \
                                <abbr title="<%=d.format(event.dtstart, d.masks.isoDateTimeO)%>" class="dtstart"><%=start%></abbr>&#8211;<abbr title="<%=d.format(event.dtend, d.masks.isoDateTimeO)%>" class="dtend"><%=end%></abbr> \
                            </td> \
                            <td headers="event-info"> \
                                <a class="url summary" href="<%=event.url%>"><%=event.summary%></a> \
                                <% if (event.description) { %> \
                                <div class="description"><%=event.description%></div> \
                                <% } %> \
                                <% if (event.location) { %> \
                                <div class="location"><%=event.location%></div> \
                                <% } %> \
                            </td> \
                        </tr> \
                        <% } %> \
                        <% } %> \
                        <% } %> \
                    </tbody> \
                </table> \
                <div id="upcoming-footer"> \
                    <p><a href="<%=url%>">View the calendar</a> or subscribe: <a href="<%=ics%>">iCal</a>, <a href="<%=rss%>">XML</a>.</p> \
                </div> \
            '
        };
        
    function Day(date, events) {
        this.date = date;
        this.events = events || [];
    };
    
    return {
        init: function(url, options) {
            u.extend(o, options);
            
            // Startup a loading indicator.
            o.element = document.getElementById(o.element) || o.element;
            if (!o.element || !o.element.nodeType) {
                o.error({message: "Can't find the element \"" + o.element + '".'});
            }
            o.element.innerHTML = o.spinner || o.element.innerHTML;
            
            // Pull together the query for the events.
            var now = new Date(),
                endDate = new Date().setDate(now.getDate() + o.period),
                script = document.createElement('script'),
                query = this.buildURL(url, {
                    alt: 'json-in-script',
                    'start-min': d.format(now, d.masks.isoDateTimeO),
                    'start-max': d.format(endDate, d.masks.isoDateTimeO),
                    callback: 'window.upcomingjs.Events.parseFeed',
                    orderby: o.orderby,
                    sortorder: o.sortorder,
                    singleevents: true
                });
                
            // Send the query and add the results to the document.
            script.src = query;
            script.setAttribute('async', 'true');
            document.documentElement.firstChild.appendChild(script);
        },
        
        buildURL: function(base, params) {
            var url = [ base + '?' ];
            for (var i in params) {
                url.push('&' + i + '=' + params[i]);
            }
            return url.join('');
        },
        
        parseFeed: function(root) {
            if (!root || !root.feed) {
                o.error({message: "Invalid feed:\n" + root});
            }
            
            var feed = root.feed,
                schema = feed['xmlns$gd'],
                eventEntries = feed.entry,
                links = feed.link,
                ctx = { days: [] },
                entries = [],
                events = [],
                currentDay, previousDisplay;
            
            // Remove any events that don't have times set
            try {
                entries = eventEntries.filter(function(eventEntry, i, eventEntries) {
                    return (eventEntry['gd$when'].length && eventEntry['gd$when'][0]);
                });
            } catch(e) {
                o.error(e);
            }
             
            if (entries.length) {
                // Convert Google's EventEntry to our equivalent of a vevent.
                try {
                    events = entries.map(this.entry2Event, { schema: schema });
                } catch(e) {
                    o.error(e);
                }
                
                // Aggregate the events by day, resulting in the desired data
                // structure.
                currentDay = new Day(d.zeroTimestamp(new Date(events[0].dtstart)));
                ctx.days.push(currentDay);
                try {
                    events.forEach(function(event, i, events){
                        var startDay = d.zeroTimestamp(new Date(event.dtstart));
                        if (startDay.getTime() !== currentDay.date.getTime()) {
                            currentDay = new Day(startDay);
                            ctx.days.push(currentDay);
                        }
                        currentDay.events.push(event);
                    });
                } catch(e) {
                    o.error(e);
                }
            }
            
            // Pull out the calendar URLs of interest
            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                if (link['type'] == 'text/html' && link['rel'] == 'alternate') {
                    ctx.url = link['href'];
                } else if (link['type'] == 'application/atom+xml' && link['rel'] == schema + '#feed') {
                    ctx.rss = link['href'];
                }
            }
            ctx.ics = ctx.rss.replace('/feeds/', '/ical/') + '.ics';
            
            // Combine the data structure with the HTML template and 
            // presto-chango.
            previousDisplay = o.element.style.display;
            o.element.style.display = 'none';
            try {
                o.element.innerHTML = t.render(o.tmpl, ctx);
            } catch(e) {
                o.error(e);
            }
            o.show ? o.show.call(o.element) : o.element.style.display = previousDisplay;
        },
        
        entry2Event: function(entry, i, entries) {
            var when = entry['gd$when'][0],
                where = entry['gd$where'][0],
                links = entry['link'],
                url, classes, statuses;
            
            // Pull the event's HTML link out of the array of links.
            for (var j = 0; j < links.length; j++) {
                if (links[j]['type'] == 'text/html' && links[j]['rel'] == 'alternate') {
                    url = links[j]['href'];
                }
            }
            
            function convertAuthors(authors) {
                var organizers = [];
                for (var i = 0; i < authors.length; i++) {
                    var a = authors[i],
                        email = a.email ? a.email.$t : '';
                    organizers.push({ name: a.name.$t, email: email });
                }
                return organizers;
            }
            
            function convertStatus(status) {
                return status.replace(this.schema + '#event.', '');
            }
            
            // Return our vevent object.
            // Documentation on Google's JSON:
            // http://code.google.com/apis/gdata/docs/json.html
            // Documentation on the vevent:
            // http://microformats.org/wiki/hcalendar-cheatsheet
            // All vevent attributes are present; the ones not supported
            // are simply set to null or empty lists/hashes.
            return {
                attendee: [],
                category: [], // Google's category seems to be limited to "event" which isn't helpful
                'class': null, // public, private, confidential
                contact: null, // could use Google's author
                description: entry.content.$t,
                dtend: d.isoString(when.endTime),
                dtstart: d.isoString(when.startTime),
                duration: null,
                geo: { latitude: null, longitude: null },
                'last-modified': d.isoString(entry.updated.$t),
                location: where.valueString,
                organizer: convertAuthors(entry.author),
                rdate: null,
                rrule: null,
                status: convertStatus(entry['gd$eventStatus'].value), // tentative, confirmed, cancelled
                summary: entry.title.$t,
                uid: entry.id.$t,
                url: url
            };
        }
    };
}());

// A little nicer entry point
upcomingjs.load = function(url, options) {
    return upcomingjs.Events.init(url, options);
}

// Wrap in a jQuery plugin, if it's available
if (window.jQuery) {
    (function($) {
        $.fn.upcoming = function(url, options) {
            options = options || {};
            options.element = this[0];
            upcomingjs.load(url, options);
        };
    }(jQuery));
}
