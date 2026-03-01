import { parseISO } from 'date-fns';
import { EventObj } from './types';

export const processEvent = ( item : any ) : EventObj => {
    const startDateString = item.start.dateTime || item.start.date;
    const endDateString = item.end.dateTime || item.end.date;

    const formattedStart = parseISO(startDateString);
    const formattedEnd = parseISO(endDateString);

    const formattedDescription = item.description ?? "";
    const isAllday = !!item.start.date && !item.start.dateTime;

    return {
        id: item.id,
        title: item.summary,
        description: formattedDescription,
        organizer: item.organizer.email,
        allDay: isAllday,
        startDate: formattedStart,
        endDate: formattedEnd,
    };
};

export const processCalendar = ( calendar : any ) : EventObj[] => {
    if (!calendar || !Array.isArray(calendar.items)) {
        return [];
    }

    return calendar.items.map(processEvent).sort(compareEvents);
};

export const compareEvents = (a: EventObj, b: EventObj): number => {
    // 1. returns which 1 starts earlier
    const startDiff = a.startDate.getTime() - b.startDate.getTime();
    if (startDiff !== 0) return startDiff;

    // 2. returns which 1 ends earlier
    const endDiff = a.endDate.getTime() - b.endDate.getTime();
    if (endDiff !== 0) return endDiff;

    // 3. returns which id is smallest
    return a.id.localeCompare(b.id);
};

