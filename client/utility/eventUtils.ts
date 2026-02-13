import { format, parseISO } from 'date-fns';

export const normalizeEvent = ( item : any ) => {
    const startDateString = item.start.dateTime || item.start.date;
    const endDateString = item.end.dateTime || item.end.date;

    const formattedStart = format(parseISO(startDateString), 'PPpp');
    const formattedEnd = format(parseISO(endDateString), 'PPpp');

    const formattedDescription = item.description ?? "";
    const isAllday = !!item.start.date && !item.start.dateTime;

    return {
        id: item.id,
        title: item.summary,
        description: formattedDescription,
        organizer: item.organizer,
        allDay: isAllday,
        startDate: formattedStart,
        endDate: formattedEnd,
    };
};