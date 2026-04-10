import { format, isSameDay, parseISO } from 'date-fns';
import { EventObj, calendarObj } from './types';

export function createEventObj(data: Partial<EventObj>): EventObj {
  return {
    id: data.id ?? crypto.randomUUID(),
    title: data.title ?? "",
    description: data.description ?? "",
    location: data.location ?? "",
    organizer: data.organizer ?? "",
    allDay: data.allDay ?? false,
    startDate: data.startDate ?? new Date(),
    endDate: data.endDate ?? new Date(),
    eventType: data.eventType ?? "default",
    sequence: data.sequence ?? 0,
    reminders: data.reminders ?? { useDefault: true },
    calendarId: data.calendarId ?? "",
    calendar: data.calendar ?? ({} as calendarObj),
    ...data // Overrides defaults with provided values
  };
} 
// usage ex: const myEvent = createEvent({ title: "Meeting", allDay: true });


export const convertToGoogleEvent = (eventObj: EventObj) => {
  const formatAllDay = (date: Date) => date.toISOString().split("T")[0];

  return {
    summary: eventObj.title,
    description: eventObj.description,
    location: eventObj.location,
    eventType: eventObj.eventType !== "default" ? eventObj.eventType : undefined, 
    start: eventObj.allDay
      ? { date: formatAllDay(eventObj.startDate), dateTime: null }
      : { date:null, dateTime: eventObj.startDate.toISOString() },
    end: eventObj.allDay
      ? { date: formatAllDay(eventObj.endDate), dateTime: null }
      : { date:null, dateTime: eventObj.endDate.toISOString() },
    ...(eventObj.recurrence && { recurrence: eventObj.recurrence }),
    sequence: eventObj.sequence,
    reminders: eventObj.reminders,
  };
};

export const processEvent = ( item : any, owner: string, calendarObj: calendarObj, calendarId: string ) : EventObj | null => {
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

    const gay: EventObj = {
      //event data
      id: item.id,
      title: item.summary,
      description: formattedDescription,
      location: item.location ?? "",
      organizer: owner,
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
      calendar: calendarObj,
      calendarId: calendarId,
    };

    return {
      //event data
      id: item.id,
      title: item.summary,
      description: formattedDescription,
      location: item.location ?? "",
      organizer: owner,
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
      calendar: calendarObj,
      calendarId: calendarId,
    };
    } catch (error) {
        console.warn("Failed to process event: ", item?.id, error);
        return null;
    }
};

export const processCalendar = ( calendar : any[], calendarId: string, calendarColor: string, owner: string, calendarObj: calendarObj ) : EventObj[] => {
    if (!calendar || !Array.isArray(calendar)) {
        return [];
    }

    return calendar
    .filter((item: any) => {
            const status = item.status?.toLowerCase().trim();
            return status !== 'cancelled';
        })
        .map((item: any) => processEvent(item, owner, calendarObj, calendarId)).filter((event: any): event is EventObj => event !== null)
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
      primary: `${format(startDate, 'MMM d')}`,
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