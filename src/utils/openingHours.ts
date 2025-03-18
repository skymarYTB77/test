import { parseISO, format, parse, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

type TimeRange = {
  start: Date;
  end: Date;
};

type DaySchedule = {
  ranges: TimeRange[];
};

type WeekSchedule = {
  [key: string]: DaySchedule;
};

const DAYS_MAP: { [key: string]: string } = {
  'Lun': 'Monday',
  'Mar': 'Tuesday',
  'Mer': 'Wednesday',
  'Jeu': 'Thursday',
  'Ven': 'Friday',
  'Sam': 'Saturday',
  'Dim': 'Sunday'
};

const parseTimeRange = (timeStr: string): TimeRange | null => {
  const [start, end] = timeStr.split('-').map(t => t.trim());
  if (!start || !end) return null;

  try {
    const today = new Date();
    const startTime = parse(start, 'HH\'h\'mm', today);
    const endTime = parse(end, 'HH\'h\'mm', today);
    
    return {
      start: startTime,
      end: endTime
    };
  } catch (error) {
    return null;
  }
};

const parseSchedule = (scheduleStr: string): WeekSchedule => {
  const schedule: WeekSchedule = {};
  
  // Split different day groups
  const groups = scheduleStr.split(';').map(g => g.trim());
  
  for (const group of groups) {
    // Split days and hours
    const [daysStr, hoursStr] = group.split(':').map(s => s.trim());
    if (!daysStr || !hoursStr) continue;

    // Parse days
    const dayRange = daysStr.split('-').map(d => d.trim());
    const startDay = dayRange[0];
    const endDay = dayRange[1] || dayRange[0];

    // Get all days in range
    const daysInRange: string[] = [];
    let currentDay = startDay;
    while (true) {
      daysInRange.push(currentDay);
      if (currentDay === endDay) break;
      // Get next day
      const days = Object.keys(DAYS_MAP);
      const currentIndex = days.indexOf(currentDay);
      currentDay = days[(currentIndex + 1) % days.length];
    }

    // Parse time ranges
    const timeRanges = hoursStr.split(',')
      .map(t => t.trim())
      .map(parseTimeRange)
      .filter((r): r is TimeRange => r !== null);

    // Add to schedule
    for (const day of daysInRange) {
      const englishDay = DAYS_MAP[day];
      if (englishDay) {
        schedule[englishDay] = {
          ranges: timeRanges
        };
      }
    }
  }

  return schedule;
};

export const isOpenNow = (openingHours: string | undefined): boolean | null => {
  if (!openingHours) return null;

  try {
    // Get current time in Paris
    const now = new Date();
    const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const currentDay = format(parisTime, 'EEEE', { locale: fr });

    // Parse schedule
    const schedule = parseSchedule(openingHours);
    const todaySchedule = schedule[currentDay];

    if (!todaySchedule) return false;

    // Check if current time is within any range
    return todaySchedule.ranges.some(range => 
      isWithinInterval(parisTime, {
        start: range.start,
        end: range.end
      })
    );
  } catch (error) {
    return null;
  }
};