import { PASTEL_COLORS } from '@/utility/constants';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { EventsContext } from './calendar-events-context';

interface UIContextType {
  isLoginVisible: boolean;
  setLoginVisible: (visible: boolean) => void;
  colors: string[];
  updateColors: Dispatch<SetStateAction<string[]>>;
}

export const UIContext = createContext<UIContextType>({
  isLoginVisible: false,
  setLoginVisible: () => {},
  colors: [],
  updateColors: () => {},
});

//convert Hex to RGB
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const findClosestColor = (targetHex: string, palette: string[]) => {
  const target = hexToRgb(targetHex);
  let closest = palette[0];
  let minDistance = Infinity;

  palette.forEach((color) => {
    const current = hexToRgb(color);
    // Euclidean distance formula: sqrt((r2-r1)^2 + (g2-g1)^2 + (b2-b1)^2)
    const distance = Math.sqrt(Math.pow(target.r - current.r, 2) + Math.pow(target.g - current.g, 2) + Math.pow(target.b - current.b, 2));

    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  });

  return closest;
};

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isLoginVisible, setLoginVisible] = useState(false);
  const { calendarObjs, setCalendarObj } = useContext(EventsContext);
  const [colors, updateColors] = useState<string[]>(PASTEL_COLORS);

  useEffect(() => {
    if (!calendarObjs) return;

    // 1. Calculate the new version
    const updated = calendarObjs.map((cal) => ({
      ...cal,
      calendarCustomColor: findClosestColor(cal.calendarDefaultColor, colors),
    }));

    // 2. CHECK: Is the new version actually different from the current one?
    // We check if ANY calendar's custom color doesn't match the newly calculated one
    const isDifferent = updated.some((newCal, index) => newCal.calendarCustomColor !== calendarObjs[index].calendarCustomColor);

    if (isDifferent) {
      setCalendarObj(updated);
    }
  }, [colors, calendarObjs]);

  return <UIContext.Provider value={{ isLoginVisible, setLoginVisible, colors, updateColors }}>{children}</UIContext.Provider>;
};
