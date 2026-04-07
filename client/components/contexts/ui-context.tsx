import { DEAFULT_COLORS_2, DEFAULT_COLORS } from '@/utility/constants';
import { colorCache } from '@/utility/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { EventsContext } from './calendar-events-context';

interface UIContextType {
  now: Date;
  isLoginVisible: boolean;
  setLoginVisible: (visible: boolean) => void;
  colors: string[];
  updateColors: Dispatch<SetStateAction<string[]>>;
  allCaches: colorCache[];
  activeCacheId: number;
  changePalette: (newPaletteId: number, newPaletteName: string, newColors: string[]) => void;
  syncCacheToPalette: (updatedPalette: string[]) => void;
  setManualCalendarColor: (calendarId: string, hexColor: string) => void;
  getCalendarColor: (calendarId: string) => string;
}

export const UIContext = createContext<UIContextType>({
  now: new Date(),
  isLoginVisible: false,
  setLoginVisible: () => {},
  colors: [],
  allCaches: [],
  activeCacheId: 0,
  updateColors: () => {},
  changePalette: () => {},
  syncCacheToPalette: () => {},
  setManualCalendarColor: () => {},
  getCalendarColor: () => {
    return '';
  },
});

//convert Hex to RGB
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

//map default colors to custom colors
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
  const [colors, updateColors] = useState<string[]>(DEFAULT_COLORS);
  const [colorId, updateColorId] = useState<number>(0);
  const [now, setNow] = useState(new Date());

  const [allCaches, setAllCaches] = useState<colorCache[]>([
    {
      paletteId: 0,
      name: 'Default Palette',
      palette: DEAFULT_COLORS_2,
      colorMap: {},
    },
  ]);
  const [activeCacheId, setActiveCacheId] = useState<number>(0);

  //DEPRECIATED
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
  }, [colors, calendarObjs, colorId]);

  //totally change color palette
  const changePalette = (newPaletteId: number, newPaletteName: string, newColors: string[]) => {
    const newColorMap: Record<string, string> = {};

    calendarObjs?.forEach((cal) => {
      newColorMap[cal.calendarId] = findClosestColor(cal.calendarDefaultColor, newColors);
    });
    setAllCaches((prev) => {
      // Check if this palette ID already exists in our storage
      const exists = prev.find((c) => c.paletteId === newPaletteId);

      // If in storage, update existing colorMap
      if (exists) {
        return prev.map((c) => (c.paletteId === newPaletteId ? { ...c, palette: newColors, colorMap: newColorMap } : c));
      }

      // Otherwise, add a brand new colorCache object to the array
      return [
        ...prev,
        {
          paletteId: newPaletteId,
          name: newPaletteName,
          palette: newColors,
          colorMap: newColorMap,
        } as colorCache,
      ];
    });

    //Update active cache ID
    setActiveCacheId(newPaletteId);
  };

  //update a color palette
  const syncCacheToPalette = (updatedPalette: string[]) => {
    setAllCaches((prev) =>
      prev.map((cache) => {
        if (cache.paletteId !== activeCacheId) return cache;

        const nextMap = { ...cache.colorMap };

        Object.keys(nextMap).forEach((calId) => {
          const currentColor = nextMap[calId];

          // If the color assigned to this calendar isn't in the new palette anymore...
          if (!updatedPalette.includes(currentColor)) {
            console.log(calId);
            const cal = calendarObjs?.find((c) => c.calendarId === calId);
            // ...recalculate the closest match from the updated palette
            nextMap[calId] = findClosestColor(cal?.calendarDefaultColor || '#000000', updatedPalette);
          }
        });
        return { ...cache, palette: updatedPalette, colorMap: nextMap };
      }),
    );
  };

  //update color of specific calendar
  const setManualCalendarColor = (calendarId: string, hexColor: string) => {
    setAllCaches((prev) =>
      prev.map((cache) => {
        // Manual override theme the user is currently updating
        if (cache.paletteId === activeCacheId) {
          return {
            ...cache,
            colorMap: {
              ...cache.colorMap,
              [calendarId]: hexColor, //update key, value pair
            },
          };
        }
        return cache;
      }),
    );
  };

  //get the color of a calendar
  const getCalendarColor = (calendarId: string): string => {
    const activeCache = allCaches.find((c) => c.paletteId === activeCacheId);
    const customColor = activeCache?.colorMap[calendarId];
    return customColor || '#00ffff';
  };

  //update only current colorCache with calendarObjs
  useEffect(() => {
    if (!calendarObjs?.length) return;

    setAllCaches((prevCaches) => {
      return prevCaches.map((cache) => {
        //ignore other caches
        if (cache.paletteId !== activeCacheId) return cache;

        const existingIds = Object.keys(cache.colorMap);
        const missingCalendars = calendarObjs.filter((cal) => !existingIds.includes(cal.calendarId));

        // If no new calendars are found, return the cache as-is (prevents re-renders)
        if (missingCalendars.length === 0) return cache;

        // Create a copy of the map and add the missing ones
        const nextMap = { ...cache.colorMap };

        missingCalendars.forEach((newCal) => {
          nextMap[newCal.calendarId] = findClosestColor(newCal.calendarDefaultColor, cache.palette);
        });

        return { ...cache, colorMap: nextMap };
      });
    });
  }, [calendarObjs, activeCacheId]);

  //update "now"
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <UIContext.Provider
      value={{
        now,
        allCaches,
        activeCacheId,
        isLoginVisible,
        setLoginVisible,
        colors,
        updateColors,
        changePalette,
        syncCacheToPalette,
        setManualCalendarColor,
        getCalendarColor,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
