/*

Limitations to this library:
    - Non-ascii characters throw intentional errors due to potential for issues when doing 'folding' (splitting to a newline every 75th character)

*/

//important note, RFC

export default class Calendar {
    name: string = 'calendar';
    description: string = 'This is a calendar.';
    timezone: string = '';
    calendarScale: string = 'GREGORIAN';
    private prodid = '-//Jason Toolbox Oettinger//NJMS//1.0';
    Events: Event[] = [];
    url: string = '';

    constructor(name: string, description?: string, url?: string) {
        this.name = name;
        this.description = description || 'This is a calendar.';
        this.url = url || '';
    }

    calendarPrelude(): String {
        return 'VERSION:2.0\r\n' +
            'PRODID:' + this.prodid + '\r\n' +
            'CALSCALE:' + this.calendarScale + '\r\n' +
            'X-WR-CALNAME:' + this.name + '\r\n' +
            'X-WR-CALDESC:' + this.description + '\r\n' +
            (this.url ? 'METHOD:PUBLISH\r\nURL:' + this.url + '\r\n' : '');
    }

    addEvent(options: EventOptions) {
        this.Events.push(new Event(options));
    }

    toString(): string {
        return 'BEGIN:VCALENDAR\r\n' +
            this.calendarPrelude() +
            this.Events
                .map(e => e.toString())
                .join('\r\n') + '\r\n' +
            'END:VCALENDAR';
    }
}

export class Event {

    private data: EventOptions

    constructor(options: EventOptions) {
        this.data = options;
    }

    toString(): string {

        const contentLines: string[] = [];

        function addContentLine(property: string, value: string): void {
            const input = property + ':' + value;
            //thanks stackoverflow again
            //we have to split lines at every 75th char. why? I really don't want to know, but it's in the spec.
            const splitInput = input.match(/.{1,70}/g)
            if (splitInput === null) {
                throw new Error('Things are bad');
            };
            contentLines.push(splitInput.join('\r\n\t') + '\r\n');
        }

        addContentLine('SUMMARY', this.data.summary);
        addContentLine('DESCRIPTION', this.data.description || 'event');
        if (this.data.allDay) {
            addContentLine('DTSTART;VALUE=DATE', dateToString(this.data.start, false));
            addContentLine('DTEND;VALUE=DATE', dateToString(this.data.end, false));
        } else {
            addContentLine('DTSTART', dateToString(this.data.start));
            addContentLine('DTEND', dateToString(this.data.end));
        }
        addContentLine('CLASS', this.data.class || 'PUBLIC');
        addContentLine('DTSTAMP', dateToString(new Date()));

        addContentLine('UID', 'tb-' + (this.data.uid || Math.random() * 10000000));

        return 'BEGIN:VEVENT\r\n' + contentLines.join('') + 'END:VEVENT';
    }
}

function hasNonAscii(string: string): boolean {
    return string.match(/[\x00-\x7F]/g) === null; //thanks stackoverflow
}

function dateToString(date: Date, useTime = true): string {
    const timeString: string = useTime ? 'T' +
        date.getUTCHours().toString().padStart(2, '0') +
        date.getUTCMinutes().toString().padStart(2, '0') +
        date.getUTCSeconds().toString().padStart(2, '0') +
        'Z'
        : '';
    return date.getUTCFullYear().toString() +
        (date.getUTCMonth() + 1).toString().padStart(2, '0') + //UTC months are zero-indexed
        date.getUTCDate().toString().padStart(2, '0') +
        timeString;
}

interface EventOptions {
    summary: string,
    description?: string,
    htmlDescription?: string,
    start: Date,
    end: Date,
    url?: string,
    uid?: string,
    allDay?: boolean,
    class?: string,
}



/*

BEGIN:VEVENT
DESCRIPTION:
DTEND;VALUE=DATE:20180903
DTSTAMP:20180828T224300Z
DTSTART;VALUE=DATE:20180903
CLASS:PUBLIC
SEQUENCE:0
SUMMARY:Post PPI certification  [EDUC6106K000 Health Equity&Soc Justice I]
UID:event-assignment-269521
URL:https://rutgers.instructure.com/calendar?include_contexts=course_10507&
 month=09&year=2018#assignment_269521
X-ALT-DESC;FMTTYPE=text/html:
END:VEVENT

        const timezone = `BEGIN:VTIMEZONE
        TZID:Etc/UTC
        X-LIC-LOCATION:Etc/UTC
        BEGIN:STANDARD
        TZOFFSETFROM:+0000
        TZOFFSETTO:+0000
        TZNAME:GMT
        DTSTART:19700101T000000
        END:STANDARD
        END:VTIMEZONE
        BEGIN:VTIMEZONE
        TZID:America/New_York
        X-LIC-LOCATION:America/New_York
        BEGIN:DAYLIGHT
        TZOFFSETFROM:-0500
        TZOFFSETTO:-0400
        TZNAME:EDT
        DTSTART:19700308T020000
        RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
        END:DAYLIGHT
        BEGIN:STANDARD
        TZOFFSETFROM:-0400
        TZOFFSETTO:-0500
        TZNAME:EST
        DTSTART:19701101T020000
        RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
        END:STANDARD
        END:VTIMEZONE`.split(/\s+/g).join('\r\n');//split on whitespace and rejoin with correct \r\n
*/