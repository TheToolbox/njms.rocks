import Calendar from './ical';
import * as fs from 'fs';

const calendarDir = './calendars';
const sources = fs.readdirSync(calendarDir)
    .filter(fileName => fileName.indexOf('.csv') > -1)
    .forEach(generateCalendar);


function generateCalendar(fileName: string) {
    const calendarName = fileName.substring(0, fileName.lastIndexOf('.'));
    const calendarSource = fs.readFileSync(calendarDir + '/' + fileName)
        .toString()
        .replace(/\r/g, '')
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => {
            const parts: string[] = [];
            let temp = '';
            let isQuote = false;
            let isEscaped = false;
            for (const c of line) {
                if (c === '\\') {//TODO learn how escaping works for csv technically
                    isEscaped = !isEscaped;
                    if (isEscaped) { continue; }
                } else {
                    isEscaped = false;
                }
                if (c === '"' && !isEscaped) {
                    isQuote = !isQuote;
                    continue;
                }
                if (c === ',' && !isQuote) {
                    parts.push(temp);
                    temp = '';
                    continue;
                }
                temp += c;
            }

            return {
                date: parts[0] + ' 2018', //WARNING: VERY MUCH NOT GENERAL
                time: parts[1],
                length: parts[2],
                lecture: parts[3],
                name: parts[4],
                lecturer: temp
            };
        });


    const c = new Calendar(calendarName, '');
    calendarSource.forEach((event, index) => {
        event.time = event.time === 'Anytime' ? '' : event.time;

        let allDay: boolean = event.time.length < 3;
        const day = new Date(event.date + ' 00:00:00 EST');//should always be the same EST/DST day, transition happens at 2am
        let start: Date = allDay ? new Date(event.date + ' 00:00:00 ' + timezone(day)) : new Date(event.date + ' ' + event.time + ' ' + timezone(day));
        const end = new Date(start);
        end.setTime(end.getTime() + (Number(event.length) * 60 * 60 * 1000));
        if (!isFinite(start.getTime()) || !isFinite(end.getTime())) {
            throw new Error(`Attempted to build invalid date! Date(${event.date}) and Time(${event.time})`);
        }


        //touching up name of events
        let name = event.name.replace(/mandatory/ig, 'MANDATORY').trim();//capitalize all instances of MANDATORY
        name = event.lecture ?//if the event has a lecture label
            event.lecture.trim() + ': ' + name.replace(/\s*Lecture:\s*/ig, '') //remove Lecture label and replace with L1/2/3/etc.
            : name;

        c.addEvent({
            summary: name,
            start: start,
            end: end,
            description: event.lecturer,
            allDay: allDay,
            uid: String(index),
        });
    });
}


console.log(c.toString());
//console.log(hiid);

function timezone(date: Date): string {
    //works only for Eastern Time observed by NJ
    //this needs to be waaaaaaaaaay more robust
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const pastMar11 = month > 2 || (month === 2 && day >= 11);
    const beforeNov4 = month < 10 || (month === 10 && day < 4);
    if (pastMar11 && beforeNov4) { // between mar 11 (2am) and nov 4 (2am)
        //It's DST!
        return 'EDT';
    } else {
        return 'EST';
    }
}