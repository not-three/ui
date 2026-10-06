import type { ToolRun } from '../types';

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Unit = 'minute' | 'hour' | 'day' | 'month' | 'weekday';
type Clause = { kind: 'all' | 'value' | 'range' | 'step'; start: number; end: number; step: number; fromAll: boolean };
type ParsedField = { unit: Unit; values: Set<number>; clauses: Clause[]; unrestricted: boolean };

function field(source: string, unit: Unit, minimum: number, maximum: number, names: string[] = []): ParsedField {
  const values = new Set<number>();
  const clauses: Clause[] = [];
  const number = (part: string) => {
    const named = names.indexOf(part.toUpperCase());
    return named >= 0 ? named + minimum : Number(part);
  };
  for (const piece of source.split(',')) {
    const match = /^(\*|[A-Za-z]+|\d+)(?:-([A-Za-z]+|\d+))?(?:\/(\d+))?$/.exec(piece);
    if (!match || (match[1] === '*' && match[2] !== undefined)) throw new Error(`Invalid cron field: ${source}`);
    const [, startText, endText, stepText] = match;
    const step = stepText === undefined ? 1 : Number(stepText);
    const start = startText === '*' ? minimum : number(startText!);
    const end = startText === '*' ? maximum : endText === undefined ? (stepText === undefined ? start : maximum) : number(endText);
    if (!Number.isInteger(step) || step < 1 || !Number.isInteger(start) || !Number.isInteger(end) || start < minimum || start > maximum || end < minimum || end > maximum || start > end) throw new Error(`Invalid cron field: ${source}`);
    clauses.push({ kind: stepText !== undefined ? 'step' : startText === '*' ? 'all' : endText !== undefined ? 'range' : 'value', start, end, step, fromAll: startText === '*' });
    for (let value = start; value <= end; value += step) values.add(value);
  }
  return { unit, values, clauses, unrestricted: clauses.length === 1 && clauses[0]!.kind === 'all' };
}

function localParts(date: Date, formatter: Intl.DateTimeFormat, timezone: string): number[] {
  if (timezone === 'UTC') return [date.getUTCMinutes(), date.getUTCHours(), date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCDay(), date.getUTCFullYear()];
  const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  return [Number(parts.minute), Number(parts.hour), day, month, new Date(Date.UTC(year, month - 1, day)).getUTCDay(), year];
}

function describe(field: ParsedField): string {
  const label = (value: number) => field.unit === 'month' ? monthNames[value - 1]! : field.unit === 'weekday' ? weekdayNames[value % 7]! : String(value);
  const singular = field.unit === 'weekday' ? 'day of the week' : field.unit;
  const plural = field.unit === 'weekday' ? 'days of the week' : `${field.unit}s`;
  return field.clauses.map(clause => {
    if (clause.kind === 'all') return `every ${singular}`;
    if (clause.kind === 'value') return field.unit === 'month' || field.unit === 'weekday' ? label(clause.start) : `${singular} ${label(clause.start)}`;
    if (field.unit === 'weekday' && clause.kind === 'range' && clause.start === 0 && clause.end === 7) return 'every day of the week';
    if (clause.kind === 'range') return field.unit === 'month' || field.unit === 'weekday'
      ? `${label(clause.start)} through ${label(clause.end)}`
      : `${plural} ${label(clause.start)} through ${label(clause.end)}`;
    const frequency = clause.step === 1 ? `every ${singular}` : `every ${clause.step} ${plural}`;
    return clause.fromAll ? frequency : `${frequency} from ${label(clause.start)} through ${label(clause.end)}`;
  }).join(' and ');
}

function explain(fields: [ParsedField, ParsedField, ParsedField, ParsedField, ParsedField], timezone: string): string {
  const [minute, hour, day, month, weekday] = fields;
  const minuteValue = minute.clauses.length === 1 && minute.clauses[0]!.kind === 'value' ? minute.clauses[0]!.start : undefined;
  const hourValue = hour.clauses.length === 1 && hour.clauses[0]!.kind === 'value' ? hour.clauses[0]!.start : undefined;
  const minuteStep = minute.clauses.length === 1 && minute.clauses[0]!.kind === 'step' && minute.clauses[0]!.fromAll ? minute.clauses[0]!.step : undefined;
  const time = minuteValue !== undefined && hourValue !== undefined ? `At ${String(hourValue).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')}`
    : minute.unrestricted && hour.unrestricted ? 'Every minute'
      : minuteStep !== undefined ? `${minuteStep === 1 ? 'Every minute' : `Every ${minuteStep} minutes`}${hour.unrestricted ? '' : ` during ${describe(hour)}`}`
        : hour.unrestricted ? `At ${describe(minute)} of every hour`
          : minute.unrestricted ? `Every minute during ${describe(hour)}`
            : `At ${describe(minute)} during ${describe(hour)}`;
  const date = day.unrestricted && month.unrestricted && weekday.unrestricted ? 'every day'
    : !day.unrestricted && month.unrestricted && weekday.unrestricted ? `on ${describe(day)} of every month`
      : !day.unrestricted && weekday.unrestricted ? `on ${describe(day)} of ${describe(month)}`
        : !weekday.unrestricted && day.unrestricted ? `on ${describe(weekday)}${month.unrestricted ? '' : ` in ${describe(month)}`}`
          : day.unrestricted && weekday.unrestricted ? `every day in ${describe(month)}`
            : `on ${describe(day)} or ${describe(weekday)}${month.unrestricted ? '' : ` in ${describe(month)}`}`;
  return `${time} ${date} (${timezone}).`;
}

export const run: ToolRun = async (inputs, options, context) => {
  const input = inputs.input;
  if (!input || input.kind !== 'text') throw new Error('Cron expression is required');
  const parts = input.text.trim().split(/\s+/);
  if (parts.length !== 5) return { kind: 'report', items: [{ level: 'error', message: 'Cron expression needs five fields' }] };
  try {
    const fields: [ParsedField, ParsedField, ParsedField, ParsedField, ParsedField] = [
      field(parts[0]!, 'minute', 0, 59), field(parts[1]!, 'hour', 0, 23), field(parts[2]!, 'day', 1, 31),
      field(parts[3]!, 'month', 1, 12, months), field(parts[4]!, 'weekday', 0, 7, weekdays),
    ];
    const [minuteField, hourField, dayField, monthField, weekdayField] = fields;
    const [minutes, hours, days, monthsSet] = [minuteField.values, hourField.values, dayField.values, monthField.values];
    const weekdaysSet = new Set(weekdayField.values);
    if (weekdaysSet.has(7)) { weekdaysSet.delete(7); weekdaysSet.add(0); }
    const timezone = String(options.timezone || 'UTC');
    const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const start = options.from ? new Date(String(options.from)) : new Date();
    if (!Number.isFinite(start.getTime())) throw new Error('Invalid start time');
    const rows: string[][] = [];
    const firstMinute = Math.floor(start.getTime() / 60000) * 60000 + 60000;
    const firstDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() - 1));
    const limit = new Date(firstDay);
    limit.setUTCFullYear(limit.getUTCFullYear() + 30);
    for (let localDay = firstDay.getTime(); localDay <= limit.getTime() && rows.length < 5; localDay += 86400000) {
      if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const date = new Date(localDay);
      const day = date.getUTCDate();
      const month = date.getUTCMonth() + 1;
      const weekday = date.getUTCDay();
      const dayMatches = dayField.unrestricted && weekdayField.unrestricted ? true : dayField.unrestricted ? weekdaysSet.has(weekday!) : weekdayField.unrestricted ? days.has(day!) : days.has(day!) || weekdaysSet.has(weekday!);
      if (!monthsSet.has(month) || !dayMatches) continue;
      const windowStart = Math.max(firstMinute, localDay - 15 * 3600000);
      const windowEnd = localDay + 39 * 3600000;
      for (let time = windowStart; time < windowEnd && rows.length < 5; time += 60000) {
        if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
        const [minute, hour, localDate, localMonth, , year] = localParts(new Date(time), formatter, timezone);
        if (year === date.getUTCFullYear() && localMonth === month && localDate === day && minutes.has(minute!) && hours.has(hour!)) rows.push([new Date(time).toISOString()]);
      }
    }
    if (rows.length < 5) throw new Error('No five runs found within thirty years');
    const expression = explain(fields, timezone);
    return { kind: 'multi', parts: [
      { label: 'Explanation', output: { kind: 'text', text: expression } },
      { label: 'Next runs', output: { kind: 'table', columns: ['UTC time'], rows } },
    ] };
  } catch (error) {
    return { kind: 'report', items: [{ level: 'error', message: error instanceof Error ? error.message : String(error) }] };
  }
};
