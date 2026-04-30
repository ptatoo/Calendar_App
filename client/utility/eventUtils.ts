import { differenceInMinutes, format, getHours, getMinutes, isSameDay, parseISO } from 'date-fns';
import { EVENT_GAP } from './constants';
import { EventObj, calendarObj } from './types';

export function createEventObj(data: Partial<EventObj>): EventObj {
  return {
    id: data.id ?? "",
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

export const processCalendar = ( calendar : any[], calendarId: string, owner: string, calendarObj: calendarObj ) : EventObj[] => {
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

export const getEventLayout = (event: EventObj, offset: number, hourHeight: number, dayWidth: number, columnWidth: number) => {
  const startHour = getHours(event.startDate);
  const startMin = getMinutes(event.startDate);
  const durationInMinutes = differenceInMinutes(event.endDate, event.startDate);

  const pixelsPerMinute = hourHeight / 60;
  const minutesFromMidnight = startHour * 60 + startMin;
  const left = offset * columnWidth;

  return {
    top: minutesFromMidnight * pixelsPerMinute,
    height: durationInMinutes * pixelsPerMinute,
    left: left,
    width: dayWidth - left - EVENT_GAP,
  };
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

//color left bar calculator
export const lightenColor = (hex: string, saturationPercentChange: number, valuePercentChange: number): string => {
  let { h, s, v } = hexToHSV(hex);

  // Increase saturation and clamp at 100%
  s = Math.min(100, s + saturationPercentChange);
  v = Math.min(100, v + valuePercentChange);

  return hsvToHex(h, s, v);
};

/**
 * Helper: Converts Hex to HSV
 * Returns h (0-360), s (0-100), v (0-100)
 */
const hexToHSV = (hex: string) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let d = max - min;
  let h = 0;
  let s = max === 0 ? 0 : (d / max) * 100;
  let v = max * 100;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
};

/**
 * Helper: Converts HSV back to Hex
 */
const hsvToHex = (h: number, s: number, v: number): string => {
  s /= 100;
  v /= 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const shadeColor = (hex: string, percent: number): string => {
  let color = hex.replace(/^#/, '');

  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  const factor = 1 - (percent / 100);

  r = Math.floor(r * factor);
  g = Math.floor(g * factor);
  b = Math.floor(b * factor);

  // Ensure values don't go below 0
  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);

  const toHex = (c: number) => c.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};