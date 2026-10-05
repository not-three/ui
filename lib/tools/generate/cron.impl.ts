import type { ToolRun } from '../types';

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function field(source: string, minimum: number, maximum: number, names: string[] = []): Set<number> {
  const values = new Set<number>();
  const number = (part: string) => {
    const named = names.indexOf(part.toUpperCase());
    return named >= 0 ? named + minimum : Number(part);
  };
  for (const piece of source.split(',')) {
    const [range, stepText] = piece.split('/');
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!range || !Number.isInteger(step) || step < 1) throw new Error(`Invalid cron field: ${source}`);
    const [startText, endText] = range === '*' ? [String(minimum), String(maximum)] : range.split('-');
    const start = number(startText!);
    const end = endText === undefined ? (stepText === undefined ? start : maximum) : number(endText);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < minimum || end > maximum || start > end) throw new Error(`Invalid cron field: ${source}`);
    for (let value = start; value <= end; value += step) values.add(value);
  }
  return values;
}

function localParts(date: Date, formatter: Intl.DateTimeFormat, timezone: string): number[] {
  if (timezone === 'UTC') return [date.getUTCMinutes(), date.getUTCHours(), date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCDay()];
  const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  return [Number(parts.minute), Number(parts.hour), day, month, new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

function explain(parts: string[], timezone: string): string {
  const [minute, hour, day, month, weekday] = parts;
  const numericTime = /^\d+$/.test(minute!) && /^\d+$/.test(hour!);
  const time = numericTime ? `At ${hour!.padStart(2, '0')}:${minute!.padStart(2, '0')}`
    : minute === '*' && hour === '*' ? 'Every minute'
      : hour === '*' ? `At minute ${minute} of every hour`
        : `At minute ${minute} during hour ${hour}`;
  const date = day === '*' && month === '*' && weekday === '*' ? 'every day'
    : day !== '*' && month === '*' && weekday === '*' ? `on day ${day} of every month`
      : day !== '*' && weekday === '*' ? `on day ${day} of month ${month}`
        : weekday !== '*' && day === '*' ? `on weekday ${weekday}${month === '*' ? '' : ` in month ${month}`}`
          : `on day ${day}, month ${month}, or weekday ${weekday}`;
  return `${time} ${date} (${timezone}).`;
}

export const run: ToolRun = async (inputs, options, context) => {
  const input = inputs.input;
  if (!input || input.kind !== 'text') throw new Error('Cron expression is required');
  const parts = input.text.trim().split(/\s+/);
  if (parts.length !== 5) return { kind: 'report', items: [{ level: 'error', message: 'Cron expression needs five fields' }] };
  try {
    const [minutes, hours, days, monthsSet, weekdaysSet] = [
      field(parts[0]!, 0, 59), field(parts[1]!, 0, 23), field(parts[2]!, 1, 31),
      field(parts[3]!, 1, 12, months), field(parts[4]!, 0, 7, weekdays),
    ];
    if (weekdaysSet.has(7)) { weekdaysSet.delete(7); weekdaysSet.add(0); }
    const timezone = String(options.timezone || 'UTC');
    const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const start = options.from ? new Date(String(options.from)) : new Date();
    if (!Number.isFinite(start.getTime())) throw new Error('Invalid start time');
    const rows: string[][] = [];
    let time = Math.floor(start.getTime() / 60000) * 60000 + 60000;
    const limit = time + 5 * 366 * 24 * 60 * 60000;
    for (; time <= limit && rows.length < 5; time += 60000) {
      if (context.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const [minute, hour, day, month, weekday] = localParts(new Date(time), formatter, timezone);
      const dayMatches = parts[2] === '*' && parts[4] === '*' ? true : parts[2] === '*' ? weekdaysSet.has(weekday!) : parts[4] === '*' ? days.has(day!) : days.has(day!) || weekdaysSet.has(weekday!);
      if (minutes.has(minute!) && hours.has(hour!) && monthsSet.has(month!) && dayMatches) rows.push([new Date(time).toISOString()]);
    }
    if (rows.length < 5) throw new Error('No five runs found within five years');
    const expression = explain(parts, timezone);
    return { kind: 'multi', parts: [
      { label: 'Explanation', output: { kind: 'text', text: expression } },
      { label: 'Next runs', output: { kind: 'table', columns: ['UTC time'], rows } },
    ] };
  } catch (error) {
    return { kind: 'report', items: [{ level: 'error', message: error instanceof Error ? error.message : String(error) }] };
  }
};
