/*

Limitations to this library:
    - Non-ascii characters throw intentional errors due to potential for issues when doing 'folding' (splitting to a newline every 75th character)

*/


//important note, RFC

export default class Calendar {
    name: string;
    timezone: string = '';
    Events: Event[] = [];


    constructor(name: string) {
        this.name = name;
    }

    calendarPrelude() : String {
        return `VERSION:2.0
        
        `;
    }

    toString(): string {

        const eventStuff = this.Events
            .map(e => e.toString())
            .join('\r\n');

        return 'BEGIN:VCALENDAR\n' + this.calendarPrelude() + eventStuff + 'END:VCALENDAR'; //don't forget to add the prlude
    }
}

export class Event {

    private data: EventOptions

    constructor(options : EventOptions) {
        this.data = options;
    }

    toString(): string {
        return '';
    }
}

function hasNonAscii(string : string) : boolean {
    return string.match(/[\x00-\x7F]/g) === null; //thanks stackoverflow
}

function foldContentLine(input: string): string {
    //thanks stackoverflow again
    //we have to split lines at every 75th char. why? I really don't want to know, but it's in the spec.
    const splitInput = input.match(/.{1,2}/g)
    if (splitInput === null) {
        throw new Error('Things are bad');
    };
    return splitInput.join('\r\n\t');
}

interface EventOptions {
    summary: string,
    description?: string,
    htmlDescription?: string,
    start: Date | string,
    end: Date | string,
    url?: string,
    uid?: string,

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
*/