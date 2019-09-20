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
            let isQuoted = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1] || '';

                if (char === '"') {
                    if (nextChar === '"') {
                        temp += char;
                        i += 1;
                        continue;
                    } else {
                        isQuoted = !isQuoted;
                        continue;
                    }
                }

                if (char === ',' && !isQuoted) {
                    parts.push(temp);
                    temp = '';
                    continue;
                }
                temp += char;
            }

            return {
                date: parts[1] + ' ' + parts[0],
                time: parts[2] || '',
                length: parts[3] || '',
                lecture: parts[4] || '',
                name: parts[5],
                lecturer: temp
            };
        });


    const c = new Calendar(calendarName, '');
    calendarSource.forEach((event, index) => {
        if (event.time === 'Anytime' || event.time === 'anytime') {
            event.time = '';
        }

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

    fs.writeFileSync(calendarDir + '/' + calendarName + '.ical', c.toString());
}

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