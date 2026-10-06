import { expect, it } from 'vitest';
import { run } from './case.impl';
import { textInput } from '../testing';

const context = { signal: new AbortController().signal, reportProgress() {} };
const convert = (text: string, style: string) => run({ input: textInput(text) }, { style }, context);

it.each([
  ['upper', 'HTTP RESPONSE_CODE!', 'HTTP RESPONSE_CODE!'],
  ['lower', 'HTTP RESPONSE_CODE!', 'http response_code!'],
  ['title', 'HTTP_RESPONSE code!', 'Http Response Code'],
  ['camel', 'HTTP_RESPONSE code!', 'httpResponseCode'],
  ['snake', 'HTTPResponse code!', 'http_response_code'],
  ['kebab', 'HTTPResponse code!', 'http-response-code'],
  ['constant', 'HTTPResponse code!', 'HTTP_RESPONSE_CODE'],
])('converts %s while handling punctuation and acronyms', async (style, input, expected) => {
  expect(await convert(input, style)).toMatchObject({ kind: 'text', text: expected });
});

it('preserves Unicode letters in word forms', async () => {
  expect(await convert('École 東京 café', 'kebab')).toMatchObject({ kind: 'text', text: 'école-東京-café' });
});

it.each([
  ['upper', 'straße 🙂 서울', 'STRASSE 🙂 서울'],
  ['snake', 'École🙂HTTPServer', 'école_http_server'],
  ['camel', '東京 café🙂Store', '東京CaféStore'],
])('handles Unicode and surrogate pairs in %s', async (style, source, expected) => {
  expect(await convert(source, style)).toMatchObject({ kind: 'text', text: expected });
});
