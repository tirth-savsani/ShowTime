/**
 * Show Scheduler Service (Phase 3)
 *
 * Maintains a rolling 7-day schedule window across all active screens and theatres:
 * - 4 shows per screen per day: ~10:00, 13:30, 17:00, 20:30 IST
 * - Deterministic, diverse movie allocation across screens
 * - Idempotent: checks for existing shows before inserting
 */

import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';
import { Theatre } from '../models/Theatre.js';
import { Movie } from '../models/Movie.js';
import {
  MOVIE_STATUSES,
  SHOW_STATUSES,
  SHOW_ADS_MINUTES,
} from '../config/constants.js';

// IST daily show time slots
export const SHOW_SLOTS_IST = [
  { hour: 10, minute: 0 },
  { hour: 13, minute: 30 },
  { hour: 17, minute: 0 },
  { hour: 20, minute: 30 },
];

/**
 * Converts a base calendar date and IST hour:minute into a UTC Date object.
 * IST = UTC + 5:30 -> UTC = IST - 5:30
 */
export const createISTDate = (baseDate, istHour, istMinute) => {
  const d = new Date(baseDate);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();

  // Midnight IST is 18:30 UTC of previous day
  // startTime in UTC = midnight UTC of date + (istHour * 60 + istMinute - 330) minutes
  const totalISTMinutes = istHour * 60 + istMinute;
  const utcOffsetMinutes = totalISTMinutes - 330; // 5 hours 30 mins = 330 mins

  const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  utcDate.setUTCMinutes(utcOffsetMinutes);
  return utcDate;
};

/**
 * Deterministic integer hash for balanced pseudo-random distribution
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * Ensures rolling shows are scheduled for the next `daysAhead` days (default 7).
 */
export const ensureRollingShows = async ({ daysAhead = 7, cleanOld = false } = {}) => {
  try {
    const [nowShowingMovies, activeScreens] = await Promise.all([
      Movie.find({ status: MOVIE_STATUSES.NOW_SHOWING, isDeleted: false }),
      Screen.find({ isActive: true }).populate('theatre'),
    ]);

    if (!nowShowingMovies.length) {
      console.warn('[ShowScheduler] No now_showing movies found to schedule.');
      return { insertedCount: 0, skippedCount: 0 };
    }

    if (!activeScreens.length) {
      console.warn('[ShowScheduler] No active screens found to schedule.');
      return { insertedCount: 0, skippedCount: 0 };
    }

    // Today in IST
    const now = new Date();
    // Current IST date representation
    const istNow = new Date(now.getTime() + 330 * 60 * 1000);
    const todayIST = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()));

    const showsToInsert = [];
    let skippedCount = 0;

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const targetDate = new Date(todayIST);
      targetDate.setUTCDate(targetDate.getUTCDate() + dayOffset);

      for (const screen of activeScreens) {
        if (!screen.theatre || !screen.theatre.isActive) continue;

        // Extract categories present in this screen's layout
        const categories = [...new Set(screen.layout.rows.map((r) => r.category))];
        const screenHasImax = /imax/i.test(screen.name) || (screen.theatre.amenities && screen.theatre.amenities.some(a => /imax/i.test(a)));
        const screenHas4DX = /4dx/i.test(screen.name) || (screen.theatre.amenities && screen.theatre.amenities.some(a => /4dx/i.test(a)));

        for (let slotIdx = 0; slotIdx < SHOW_SLOTS_IST.length; slotIdx++) {
          const slot = SHOW_SLOTS_IST[slotIdx];
          const startTime = createISTDate(targetDate, slot.hour, slot.minute);

          // If showtime is in the past, skip
          if (startTime.getTime() <= now.getTime()) {
            skippedCount++;
            continue;
          }

          // Check if show already exists for this screen at or near this startTime (within 90 mins)
          const windowStart = new Date(startTime.getTime() - 90 * 60 * 1000);
          const windowEnd = new Date(startTime.getTime() + 90 * 60 * 1000);

          const existing = await Show.findOne({
            screen: screen._id,
            startTime: { $gte: windowStart, $lte: windowEnd },
            status: { $ne: SHOW_STATUSES.CANCELLED },
          });

          if (existing) {
            skippedCount++;
            continue;
          }

          // Pick movie deterministically for variety
          const seedStr = `${screen._id.toString()}-${dayOffset}-${slotIdx}`;
          const movieIdx = hashString(seedStr) % nowShowingMovies.length;
          const movie = nowShowingMovies[movieIdx];

          // Compute format: prioritize IMAX or 4DX if screen supports it and movie supports it
          let chosenFormat = '2D';
          if (screenHasImax && movie.formats.includes('IMAX')) {
            chosenFormat = 'IMAX';
          } else if (screenHas4DX && movie.formats.includes('4DX')) {
            chosenFormat = '4DX';
          } else if (movie.formats.includes('3D') && slotIdx % 2 === 1) {
            chosenFormat = '3D';
          }

          // Compute language: match movie languages, prefer Hindi or English or first language
          const chosenLanguage = movie.languages[slotIdx % movie.languages.length] || movie.languages[0];

          // Pricing map based on category
          const pricing = {};
          if (categories.includes('PLATINUM')) {
            pricing.PLATINUM = chosenFormat === 'IMAX' ? 450 : chosenFormat === '4DX' ? 400 : 350;
          }
          if (categories.includes('GOLD')) {
            pricing.GOLD = chosenFormat === 'IMAX' ? 320 : chosenFormat === '4DX' ? 280 : 250;
          }
          if (categories.includes('SILVER')) {
            pricing.SILVER = chosenFormat === 'IMAX' ? 220 : chosenFormat === '4DX' ? 200 : 180;
          }

          // Fallback if layout had different categories
          for (const cat of categories) {
            if (!pricing[cat]) pricing[cat] = 200;
          }

          const endTime = new Date(startTime.getTime() + (movie.durationMin + SHOW_ADS_MINUTES) * 60 * 1000);

          showsToInsert.push({
            movie: movie._id,
            theatre: screen.theatre._id,
            screen: screen._id,
            city: screen.theatre.city,
            startTime,
            endTime,
            language: chosenLanguage,
            format: chosenFormat,
            pricing,
            status: SHOW_STATUSES.SCHEDULED,
          });
        }
      }
    }

    if (showsToInsert.length > 0) {
      await Show.insertMany(showsToInsert, { ordered: false });
      console.log(`[ShowScheduler] Inserted ${showsToInsert.length} rolling shows for next ${daysAhead} days.`);
    }

    return {
      insertedCount: showsToInsert.length,
      skippedCount,
    };
  } catch (err) {
    console.error('[ShowScheduler] Error in ensureRollingShows:', err.message);
    throw err;
  }
};

export default {
  ensureRollingShows,
  createISTDate,
  SHOW_SLOTS_IST,
};
