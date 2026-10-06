import type { ToolRun } from '../types';
import { errorReport, requireText } from './shared';

function zonedParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hourCycle: 'h23',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);
  const offsetMinutes = Math.round((Date.UTC(year, month - 1, day, hour, minute, second) - Math.floor(date.getTime() / 1000) * 1000) / 60000);
  return { year, month, day, hour, minute, second, weekday: parts.weekday!, offsetMinutes };
}

function validCalendarDate(year: number, month: number, day: number): boolean {
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]!;
}

function parseRfc3339(source: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?([Zz]|[+-]\d{2}:\d{2})$/.exec(source);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (!validCalendarDate(year, month, day) || hour > 23 || minute > 59 || second > 59) return null;
  const milliseconds = Number((match[7] ?? '').slice(0, 3).padEnd(3, '0'));
  const zone = match[8]!;
  let offsetMinutes = 0;
  if (zone.toUpperCase() !== 'Z') {
    const offsetHours = Number(zone.slice(1, 3));
    const offsetRemainder = Number(zone.slice(4, 6));
    if (offsetHours > 23 || offsetRemainder > 59) return null;
    offsetMinutes = (zone[0] === '+' ? 1 : -1) * (offsetHours * 60 + offsetRemainder);
  }
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, milliseconds);
  return date.getTime() - offsetMinutes * 60_000;
}

function parseRfc(source: string): number | null {
  const match = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?\s+([+-]\d{4}|GMT|UT|UTC|Z|EST|EDT|CST|CDT|MST|MDT|PST|PDT)$/i.exec(source);
  if (!match) return null;
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const day = Number(match[2]);
  const month = months.indexOf(match[3]!.toLowerCase()) + 1;
  const year = Number(match[4]);
  const hour = Number(match[5]);
  const minute = Number(match[6]);
  const second = Number(match[7] ?? 0);
  if (!validCalendarDate(year, month, day) || hour > 23 || minute > 59 || second > 59) return null;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  if (weekdays[date.getUTCDay()] !== match[1]!.toLowerCase()) return null;
  const zone = match[8]!.toUpperCase();
  const namedOffsets: Record<string, number> = { GMT: 0, UT: 0, UTC: 0, Z: 0, EST: -300, EDT: -240, CST: -360, CDT: -300, MST: -420, MDT: -360, PST: -480, PDT: -420 };
  let offsetMinutes = namedOffsets[zone];
  if (offsetMinutes === undefined) {
    const hours = Number(zone.slice(1, 3));
    const minutes = Number(zone.slice(3, 5));
    if (hours > 23 || minutes > 59) return null;
    offsetMinutes = (zone[0] === '+' ? 1 : -1) * (hours * 60 + minutes);
  }
  return date.getTime() - offsetMinutes * 60_000;
}

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input).trim();
  const format = String(options.format ?? 'iso');
  const timezone = String(options.timezone ?? 'UTC').trim();
  const epoch = /^-?\d+(?:\.\d+)?$/.test(source) ? Number(source) * 1000
    : parseRfc3339(source) ?? parseRfc(source) ?? NaN;
  if (!Number.isFinite(epoch) || !Number.isFinite(new Date(epoch).getTime())) return errorReport('Invalid timestamp');
  if (format === 'unix') return { kind: 'text', text: String(Math.floor(epoch / 1000)) };
  let parts: ReturnType<typeof zonedParts>;
  try { parts = zonedParts(new Date(epoch), timezone); } catch { return errorReport('Invalid timezone'); }
  const pad = (number: number) => String(number).padStart(2, '0');
  const sign = parts.offsetMinutes < 0 ? '-' : '+';
  const absolute = Math.abs(parts.offsetMinutes);
  const offset = sign + pad(Math.floor(absolute / 60)) + pad(absolute % 60);
  const date = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
  const time = `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
  if (format === 'rfc') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { kind: 'text', text: `${parts.weekday}, ${pad(parts.day)} ${months[parts.month - 1]} ${parts.year} ${time} ${offset}` };
  }
  return { kind: 'text', text: `${date}T${time}${offset.slice(0, 3)}:${offset.slice(3)}`, language: 'text' };
};
