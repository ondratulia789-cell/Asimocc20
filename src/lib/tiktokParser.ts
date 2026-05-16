import JSZip from 'jszip';

export interface TikTokStats {
  totalMinutes: number;
  totalVideos: number;
  longestSession: number;
  averageDaily: number;
  monthlyData: { month: string; minutes: number }[];
  periodStart: string;
  periodEnd: string;
  recordDay: { date: string; count: number };
  recordDayMinutes: { date: string; minutes: number };
  recordWeek: { weekStart: string; weekEnd: string; count: number };
  lastMonthMinutes: number;
  lastMonthVideos: number;
  // Extreme / emotional metrics
  nightOwlMinutes: number;          // 00:00 – 05:00
  nightOwlPercent: number;          // % z celkového času
  opportunityCostCZK: number;       // čas × 150 Kč/h
  scrollKm: number;                 // odhad svislé dráhy scrollu
  marathonsTime: number;            // kolik maratonů by stihl/a
  booksRead: number;                // 8h/kniha
  earthLaps: number;                // (běh) kolikrát kolem Země
  averageSessionMin: number;
  dopamineRating: { label: string; level: 1 | 2 | 3 | 4 | 5; description: string };
}

interface VideoHistoryItem {
  Date?: string;
  date?: string;
  Link?: string;
  VideoLink?: string;
}

interface ParsedRecord {
  timestamp: number;
  month: number;
  year: number;
  yearMonthKey: string;
  dayKey: string;
  isoDateStr: string;
}

const MONTHS = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
const MAX_GAP_SECONDS = 180; // Session break threshold (3 minutes)
const MAX_VIDEO_DURATION = 90; // Cap for single video viewing time

function parseToTimestamp(dateStr: string): number {
  const normalized = dateStr
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Try standard parsing first
  let d = new Date(normalized);
  if (!isNaN(d.getTime())) return d.getTime();

  // Format: "2023-01-15 14:30:00 UTC" or "2023/01/15 14:30:00"
  const isoLikeMatch = normalized.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{2}:\d{2}:\d{2}))?(?:\s*(UTC|Z))?$/i);
  if (isoLikeMatch) {
    const [, year, month, day, time = '00:00:00', tz] = isoLikeMatch;
    const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}${tz ? 'Z' : ''}`;
    d = new Date(iso);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // Format: "15.01.2023 14:30:00" (European)
  const euroMatch = normalized.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s*(\d{2}:\d{2}:\d{2}))?(?:\s*(UTC|Z))?$/i);
  if (euroMatch) {
    const [, day, month, year, time = '00:00:00', tz] = euroMatch;
    const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}${tz ? 'Z' : ''}`;
    d = new Date(iso);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  return NaN;
}

function deepMergeArrays(target: any, source: any): any {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return source;
  
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (Array.isArray(result[key]) && Array.isArray(source[key])) {
      // Merge arrays (combine video lists)
      result[key] = [...result[key], ...source[key]];
    } else if (typeof result[key] === 'object' && typeof source[key] === 'object' && !Array.isArray(result[key])) {
      // Deep merge objects
      result[key] = deepMergeArrays(result[key], source[key]);
    } else if (!(key in result)) {
      result[key] = source[key];
    }
  }
  return result;
}

function isVideoHistoryTxt(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.includes('sledov') || lower.includes('browsing') || 
         lower.includes('watch') || lower.includes('video');
}

function parseTxtVideoHistory(text: string): VideoHistoryItem[] {
  const items: VideoHistoryItem[] = [];
  const blocks = text.split(/\r?\n\s*\r?\n/);
  
  for (const block of blocks) {
    const dateMatch = block.match(/(?:Datum|Date|Čas vytvoření|Time created)\s*:\s*(.+?)(?:\r?\n|$)/i);
    const linkMatch = block.match(/(?:Odkaz|Link|VideoLink)\s*:\s*(.+?)(?:\r?\n|$)/i);
    
    if (dateMatch) {
      items.push({
        Date: dateMatch[1].trim(),
        Link: linkMatch ? linkMatch[1].trim() : undefined,
      });
    }
  }
  
  console.log(`[TikTok Parser] Parsed ${items.length} records from txt`);
  return items;
}

export async function parseZipFile(file: File): Promise<any> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  
  let combinedData: any = {};
  let txtVideoItems: VideoHistoryItem[] = [];
  
  for (const [filename, zipEntry] of Object.entries(contents.files)) {
    if (zipEntry.dir) continue;

    const lowerFilename = filename.toLowerCase();
    
    if (lowerFilename.endsWith('.json')) {
      const content = await zipEntry.async('string');
      try {
        const parsed = JSON.parse(content);
        combinedData = deepMergeArrays(combinedData, parsed);
      } catch (e) {
        console.warn(`[TikTok Parser] Failed to parse ${filename}:`, e);
      }
    } else if (lowerFilename.endsWith('.txt') && isVideoHistoryTxt(filename)) {
      const content = await zipEntry.async('string');
      const items = parseTxtVideoHistory(content);
      txtVideoItems.push(...items);
    }
  }
  
  // If we found txt video history, inject it into the data structure
  if (txtVideoItems.length > 0) {
    console.log(`[TikTok Parser] Found ${txtVideoItems.length} video records from txt files`);
    if (!combinedData.Activity) combinedData.Activity = {};
    const existing = combinedData.Activity['Video Browsing History']?.VideoList || [];
    combinedData.Activity['Video Browsing History'] = {
      VideoList: [...existing, ...txtVideoItems],
    };
  }
  
  return combinedData;
}

export async function parseTxtFile(file: File): Promise<any> {
  const content = await file.text();
  const items = parseTxtVideoHistory(content);
  if (items.length === 0) {
    throw new Error('No video history found in txt file');
  }
  return {
    Activity: {
      'Video Browsing History': {
        VideoList: items,
      },
    },
  };
}

export async function parseJsonFile(file: File): Promise<any> {
  const content = await file.text();
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('[TikTok Parser] JSON parse failed:', e);
    throw e;
  }
}

export function calculateStats(data: any): TikTokStats {
  // Find video history - TikTok data can have different structures
  let videoHistory: VideoHistoryItem[] = [];
  
  // Extended list of possible paths in TikTok data export
  const possiblePaths = [
    data?.Activity?.['Video Browsing History']?.VideoList,
    data?.Activity?.['Video Browsing History'],
    data?.['Video Browsing History']?.VideoList,
    data?.['Video Browsing History'],
    data?.Activity?.VideoList,
    data?.VideoList,
    data?.['Browsing History']?.VideoList,
    data?.['Browsing History'],
    data?.Activity?.['Browsing History']?.VideoList,
    data?.Activity?.['Browsing History'],
    data?.['Watch History']?.VideoList,
    data?.['Watch History'],
    data?.Activity?.['Watch History']?.VideoList,
    data?.Activity?.['Watch History'],
  ];

  for (const path of possiblePaths) {
    if (Array.isArray(path) && path.length > 0) {
      videoHistory = path;
      break;
    }
  }

  // Deep search if not found in common paths
  if (videoHistory.length === 0) {
    const findAllVideoArrays = (obj: any, depth = 0): VideoHistoryItem[][] => {
      if (depth > 10 || !obj || typeof obj !== 'object') return [];
      
      const results: VideoHistoryItem[][] = [];
      
      if (Array.isArray(obj)) {
        // Check if this array contains video history items
        if (obj.length > 0 && (obj[0].Date || obj[0].date || obj[0].Link || obj[0].VideoLink)) {
          results.push(obj);
        }
        // Also search within array items
        for (const item of obj) {
          results.push(...findAllVideoArrays(item, depth + 1));
        }
      } else {
        for (const value of Object.values(obj)) {
          results.push(...findAllVideoArrays(value, depth + 1));
        }
      }
      
      return results;
    };
    
    const allArrays = findAllVideoArrays(data);
    // Pick the largest array that looks like video history
    if (allArrays.length > 0) {
      videoHistory = allArrays.reduce((a, b) => a.length > b.length ? a : b);
    }
  }

  console.log(`[TikTok Parser] Found ${videoHistory.length} total video records`);

  let skippedNoDate = 0;
  let skippedInvalidDate = 0;
  let earliestTimestamp = Infinity;
  let latestTimestamp = 0;

  const records: ParsedRecord[] = videoHistory
    .map(item => {
      const dateStr = item.Date || item.date;
      if (!dateStr) {
        skippedNoDate++;
        return null;
      }
      const timestamp = parseToTimestamp(dateStr);
      if (isNaN(timestamp)) {
        skippedInvalidDate++;
        return null;
      }
      
      // Track earliest and latest timestamps
      if (timestamp < earliestTimestamp) earliestTimestamp = timestamp;
      if (timestamp > latestTimestamp) latestTimestamp = timestamp;
      
      const d = new Date(timestamp);
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth();
      const day = d.getUTCDate();
      return {
        timestamp,
        month,
        year,
        yearMonthKey: `${year}-${String(month).padStart(2, '0')}`,
        dayKey: `${year}-${month}-${day}`,
        isoDateStr: d.toISOString(),
      };
    })
    .filter((r): r is ParsedRecord => r !== null);

  console.log(`[TikTok Parser] Filtering stats: noDate=${skippedNoDate}, invalidDate=${skippedInvalidDate}`);
  console.log(`[TikTok Parser] Valid records: ${records.length}`);

  // Sort chronologically (ascending)
  records.sort((a, b) => a.timestamp - b.timestamp);

  // Calculate viewing time based on gaps between consecutive records
  let totalSeconds = 0;
  let nightOwlSeconds = 0; // 00:00 – 05:00 local time
  const monthlySeconds: Record<string, number> = {};
  const dailySeconds: Record<string, number> = {};
  const sessionLengths: number[] = [];
  let longestSessionSeconds = 0;
  let currentSessionStart = 0;
  let currentSessionEnd = 0;

  const flushSession = () => {
    if (currentSessionStart > 0) {
      const sessionDuration = (currentSessionEnd - currentSessionStart) / 1000;
      longestSessionSeconds = Math.max(longestSessionSeconds, sessionDuration);
      if (sessionDuration > 0) sessionLengths.push(sessionDuration);
    }
    currentSessionStart = 0;
    currentSessionEnd = 0;
  };

  for (let i = 0; i < records.length - 1; i++) {
    const current = records[i];
    const next = records[i + 1];
    const gapSeconds = (next.timestamp - current.timestamp) / 1000;

    if (gapSeconds <= MAX_GAP_SECONDS) {
      const contribution = Math.min(gapSeconds, MAX_VIDEO_DURATION);
      totalSeconds += contribution;
      monthlySeconds[current.yearMonthKey] = (monthlySeconds[current.yearMonthKey] || 0) + contribution;
      dailySeconds[current.dayKey] = (dailySeconds[current.dayKey] || 0) + contribution;

      // Night owl: scrolling between 00:00 and 05:00 local time
      const localHour = new Date(current.timestamp).getHours();
      if (localHour >= 0 && localHour < 5) {
        nightOwlSeconds += contribution;
      }

      if (currentSessionStart === 0) {
        currentSessionStart = current.timestamp;
      }
      currentSessionEnd = next.timestamp;
    } else {
      flushSession();
    }
  }
  flushSession();

  const totalMinutes = Math.round(totalSeconds / 60);
  const totalVideos = records.length;

  const monthlyData = Object.entries(monthlySeconds)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([yearMonth, seconds]) => {
      const [y, m] = yearMonth.split('-').map(Number);
      return {
        month: `${MONTHS[m]} ${y}`,
        minutes: Math.round(seconds / 60),
      };
    });

  // Count videos per day and per ISO week
  const dailyVideoCount: Record<string, number> = {};
  const weeklyVideoCount: Record<string, { count: number; dates: Date[] }> = {};

  for (const r of records) {
    dailyVideoCount[r.dayKey] = (dailyVideoCount[r.dayKey] || 0) + 1;

    const d = new Date(r.timestamp);
    // ISO week calculation
    const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const dayOfYear = Math.floor((d.getTime() - new Date(Date.UTC(d.getUTCFullYear(), 0, 1)).getTime()) / 86400000);
    const weekNum = Math.ceil((dayOfYear + jan4.getUTCDay() + 1) / 7);
    const weekKey = `${d.getUTCFullYear()}-W${weekNum}`;
    
    if (!weeklyVideoCount[weekKey]) {
      weeklyVideoCount[weekKey] = { count: 0, dates: [] };
    }
    weeklyVideoCount[weekKey].count += 1;
    weeklyVideoCount[weekKey].dates.push(d);
  }

  // Find record day
  let recordDayKey = '';
  let recordDayCount = 0;
  for (const [key, count] of Object.entries(dailyVideoCount)) {
    if (count > recordDayCount) {
      recordDayCount = count;
      recordDayKey = key;
    }
  }
  // Convert dayKey back to date
  const [ry, rm, rd] = recordDayKey.split('-').map(Number);
  const recordDayDate = new Date(Date.UTC(ry, rm, rd));

  // Find record week
  let recordWeekKey = '';
  let recordWeekCount = 0;
  for (const [key, data] of Object.entries(weeklyVideoCount)) {
    if (data.count > recordWeekCount) {
      recordWeekCount = data.count;
      recordWeekKey = key;
    }
  }
  const recordWeekData = weeklyVideoCount[recordWeekKey];
  const weekDates = recordWeekData?.dates || [];
  const weekStart = weekDates.length > 0 ? new Date(Math.min(...weekDates.map(d => d.getTime()))) : new Date();
  const weekEnd = weekDates.length > 0 ? new Date(Math.max(...weekDates.map(d => d.getTime()))) : new Date();

  // Find record day by minutes
  let recordDayMinutesKey = '';
  let recordDayMinutesValue = 0;
  for (const [key, secs] of Object.entries(dailySeconds)) {
    if (secs > recordDayMinutesValue) {
      recordDayMinutesValue = secs;
      recordDayMinutesKey = key;
    }
  }
  const [rmy, rmm, rmd] = recordDayMinutesKey.split('-').map(Number);
  const recordDayMinutesDate = recordDayMinutesKey ? new Date(Date.UTC(rmy, rmm, rmd)) : new Date();

  // Average daily usage
  const uniqueDays = Object.keys(dailySeconds).length;
  const averageDaily = uniqueDays > 0 ? totalMinutes / uniqueDays : 0;

  // Last 30 days stats
  const now = latestTimestamp !== 0 ? latestTimestamp : Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  let lastMonthSeconds = 0;
  let lastMonthVideos = 0;
  for (const r of records) {
    if (r.timestamp >= thirtyDaysAgo) {
      lastMonthVideos++;
    }
  }
  for (let i = 0; i < records.length - 1; i++) {
    if (records[i].timestamp >= thirtyDaysAgo) {
      const gap = (records[i + 1].timestamp - records[i].timestamp) / 1000;
      if (gap <= MAX_GAP_SECONDS) {
        lastMonthSeconds += Math.min(gap, MAX_VIDEO_DURATION);
      }
    }
  }

  // Format period dates for display
  const periodStart = earliestTimestamp !== Infinity ? new Date(earliestTimestamp).toISOString() : '';
  const periodEnd = latestTimestamp !== 0 ? new Date(latestTimestamp).toISOString() : '';

  // ============ Extreme metrics ============
  const totalHours = totalSeconds / 3600;
  const nightOwlMinutes = Math.round(nightOwlSeconds / 60);
  const nightOwlPercent = totalSeconds > 0 ? (nightOwlSeconds / totalSeconds) * 100 : 0;

  // Opportunity cost: 150 Kč/h student part-time
  const opportunityCostCZK = Math.round(totalHours * 150);

  // Scroll km: predpoklad ~720px swipe na 1 video, mobil ~400 DPI → ~46mm/swipe
  // bezpečně: 0.05 metru na video
  const scrollKm = Math.round((totalVideos * 0.05) / 10) / 100; // km, 2 desetinná
  // Marathon: 4h
  const marathonsTime = totalHours / 4;
  // Books: ~8h průměr
  const booksRead = totalHours / 8;
  // Earth laps: běh ~10km/h, obvod 40 075 km
  const earthLaps = (totalHours * 10) / 40075;

  const avgSessionSec = sessionLengths.length > 0
    ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length
    : 0;
  const averageSessionMin = Math.round(avgSessionSec / 60);

  // Dopamine rating
  let dopamineRating: TikTokStats['dopamineRating'];
  if (averageSessionMin < 5) {
    dopamineRating = { label: 'Goldfish Attention', level: 1, description: 'Tvůj mozek skáče rychleji než algoritmus' };
  } else if (averageSessionMin < 15) {
    dopamineRating = { label: 'Casual Scroller', level: 2, description: 'Pohoda, máš to pod kontrolou' };
  } else if (averageSessionMin < 30) {
    dopamineRating = { label: 'Doom Scroller', level: 3, description: 'Začínáš zapomínat, proč jsi telefon vzal/a' };
  } else if (averageSessionMin < 60) {
    dopamineRating = { label: 'Hardcore Binger', level: 4, description: 'Notifikace? Jaké notifikace.' };
  } else {
    dopamineRating = { label: 'Dopamine Addict', level: 5, description: 'Možná je čas si promluvit s někým blízkým' };
  }

  return {
    totalMinutes,
    totalVideos,
    longestSession: Math.round(longestSessionSeconds / 60),
    averageDaily,
    monthlyData,
    periodStart,
    periodEnd,
    recordDay: {
      date: recordDayDate.toISOString(),
      count: recordDayCount,
    },
    recordDayMinutes: {
      date: recordDayMinutesDate.toISOString(),
      minutes: Math.round(recordDayMinutesValue / 60),
    },
    recordWeek: {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      count: recordWeekCount,
    },
    lastMonthMinutes: Math.round(lastMonthSeconds / 60),
    lastMonthVideos,
    nightOwlMinutes,
    nightOwlPercent: Math.round(nightOwlPercent * 10) / 10,
    opportunityCostCZK,
    scrollKm,
    marathonsTime: Math.round(marathonsTime * 10) / 10,
    booksRead: Math.round(booksRead * 10) / 10,
    earthLaps: Math.round(earthLaps * 1000) / 1000,
    averageSessionMin,
    dopamineRating,
  };
}