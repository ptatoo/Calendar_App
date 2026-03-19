import { format, isSameDay, parseISO } from 'date-fns';
import { EventObj } from './types';

export const processEvent = ( item : any, calendarId: string, calendarColor: string ) : EventObj | null => {
    try {
    // check event is valid
    if (!item || !item.organizer?.email || !item.summary) {
      return null; 
    }

    //find start and end time
    const startDateString = item.start.dateTime || item.start.date;
    const endDateString = item.end.dateTime || item.end.date;
    if (!startDateString || !endDateString) {
      return null;
    }

    //format data
    const formattedStart = parseISO(startDateString);
    const formattedEnd = parseISO(endDateString);

    const formattedDescription = item.description ?? "";
    const isAllday = !!item.start.date && !item.start.dateTime;    

    return {
      //event data
      id: item.id,
      title: item.summary,
      description: formattedDescription,
      location: item.location ?? "",
      organizer: item.organizer.email,
      allDay: isAllday,
      startDate: formattedStart,
      endDate: formattedEnd,
      eventType: item.eventType ?? "default",

      //recurrence
      recurrence: item.recurrence ?? null,
      recurringEventId: item.recurringEventId ?? null, 
      sequence: item.sequence ?? 0,
      reminders: {
          useDefault: item.reminders?.useDefault ?? true,
          overrides: item.reminders?.overrides ?? [],
      },

      //calendar data
      calendarId: calendarId,
      displayColor: calendarColor,
    };
    } catch (error) {
        console.warn("Failed to process event: ", item?.id, error);
        return null;
    }
};

export const processCalendar = ( calendar : any, calendarId: string, calendarColor: string ) : EventObj[] => {
    if (!calendar || !Array.isArray(calendar.items)) {
        return [];
    }

    return calendar.items
    .filter((item: any) => {
            const status = item.status?.toLowerCase().trim();
            return status !== 'cancelled';
        })
        .map((item: any) => processEvent(item, calendarId, calendarColor)).filter((event: any): event is EventObj => event !== null)
        .sort(compareEvents);
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

//creates the time display for event details
export const getEventTimeDisplay = (event: EventObj) => {
  const { startDate, endDate, allDay } = event;
  const isSingleDay = isSameDay(startDate, endDate);

  // CASE 1: All-Day Event
  // Row 2: Jan 1 – Jan 2 | Row 3: All-day
  if (allDay) {
    return {
      primary: `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`,
      secondary: 'All-day',
    };
  }

  // CASE 2: Single Day (Spans 1 day)
  // Row 2: 9:00 AM – 10:00 AM | Row 3: Monday, March 18th
  if (isSingleDay) {
    return {
      primary: `${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')}`,
      secondary: format(startDate, 'EEE, MMMM do'),
    };
  }

  // CASE 3: Multi-Day (Not all-day)
  // Row 2: Start Date + Time | Row 3: End Date + Time
  return {
    primary: format(startDate, 'MMM d, h:mm a'),
    secondary: `– ${format(endDate, 'MMM d, h:mm a')}`,
  };
};