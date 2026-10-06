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

export const run: ToolRun = async (inputs, options) => {
  const source = requireText(inputs.input).trim();
  const format = String(options.format ?? 'iso');
  const timezone = String(options.timezone ?? 'UTC').trim();
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})T/.exec(source);
  if (isoDate) {
    const year = Number(isoDate[1]);
    const month = Number(isoDate[2]);
    const day = Number(isoDate[3]);
    if (!validCalendarDate(year, month, day)) return errorReport('Invalid ISO calendar date');
  }
  const rfcDate = /^[A-Za-z]{3},\s*(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\b/.exec(source);
  if (rfcDate) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = months.indexOf(rfcDate[2]!.toLowerCase()) + 1;
    if (!validCalendarDate(Number(rfcDate[3]), month, Number(rfcDate[1]))) return errorReport('Invalid RFC calendar date');
  }
  const epoch = /^-?\d+(?:\.\d+)?$/.test(source) ? Number(source) * 1000
    : /^(?:\d{4}-\d{2}-\d{2}T|[A-Za-z]{3},\s)/.test(source) ? Date.parse(source) : NaN;
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
