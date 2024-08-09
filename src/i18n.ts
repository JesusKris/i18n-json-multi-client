/**
 * ISC License
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 *
 * Original Author: ["Anton Keks"]
 * Original Repository: ["https://github.com/codeborne/i18n-json.git"]
 *
 * Modifications made by ["Robert Kris Laur"]
 * - Added client-specific translations feature by modifying the Options parameter & resolve function which now checks if the wanted key is an object.
 *   Then it checks whether the clientIdentifier has been set and takes the translation based on that, otherwise it looks for "default" key.
 *   If that is also not defined, it returns the key as is the default behavior.
 *
 * - Added _json method which returns the json object using a key. This can be used to fetch translation specific object that can be used in UI logic.
 */


export type Dict = Record<string, any>
export type Values = { [name: string]: any }

export let jsonPath = '/i18n/'
export let version = ''
export let cookieName = 'LANG'

export let langs = ['en']
export let defaultLang = 'en'
export let lang = defaultLang
export let fallbackToDefault = true
export let clientIdentifier: string | undefined = undefined

let dict: Dict = {}

export interface Options {
  langs: string[],
  defaultLang?: string,
  lang?: string,
  fallbackToDefault?: boolean
  dicts?: { [lang: string]: Dict }
  selectLang?: () => string | undefined
  jsonPath?: string
  version?: string
  cookieName?: string
  clientIdentifier?: string | undefined
}

export async function init(opts: Options) {
  langs = opts.langs
  defaultLang = opts.defaultLang ?? langs[0]
  fallbackToDefault = opts.fallbackToDefault ?? true
  lang = opts.lang ?? detectLang(opts.selectLang)
  if (opts.jsonPath) jsonPath = opts.jsonPath
  if (opts.version) version = opts.version
  if (opts.cookieName) cookieName = opts.cookieName
  if (opts.clientIdentifier) clientIdentifier = opts.clientIdentifier
  if (opts.dicts) {
    dict = opts.dicts[lang]
    if (fallbackToDefault && lang != defaultLang) mergeDicts(dict, opts.dicts[defaultLang])
  } else await loadDict()
}

export function detectLang(selectLang?: () => string | undefined, host = location.host, cookies = document.cookie) {
  const fromCookie = cookies.split('; ').find(s => s.startsWith(cookieName + '='))?.split('=')?.[1]
  const lang = ensureSupportedLang(fromCookie ?? selectLang?.() ?? navigator.language.split('-')[0])
  if (lang != fromCookie) rememberLang(lang)
  document.documentElement.setAttribute('lang', lang)
  return lang
}

export function rememberLang(lang: string) {
  document.cookie = `${cookieName}=${lang};path=/`
}

export function ensureSupportedLang(lang: string) {
  return langs.includes(lang) ? lang : defaultLang
}

export function _(key: string, values?: Values, from: Dict = dict): string {
  let result = resolve(key, from)
  if (result && values) result = replaceValues(result, values)
  return result ?? key
}

export function __(key: string, values?: Values): string | undefined {
  const result = _(key, values)
  return result != key ? result : undefined
}

export function _json(key: string, from: Dict = dict): Dict | string {
  const keys = key.split('.');
  let result = from;

  for (const k of keys) {
    if (!result || typeof result !== 'object') {
      return key;
    }
    result = result[k];
  }

  return typeof result === 'object' && result !== null ? result : key;
}

export function mergeDicts(dict: Dict, defaultDict: Dict, noTranslate: Set<string> = new Set(), parent = ''): any {
  for (const key in defaultDict) {
    const fullKey = (parent ? parent + '.' : '') + key
    if (typeof dict[key] === 'object' && typeof defaultDict[key] === 'object')
      dict[key] = mergeDicts(dict[key], defaultDict[key], noTranslate, fullKey)
    else if (!dict[key]) {
      dict[key] = defaultDict[key]
      if (!noTranslate.has(fullKey)) console.warn(`  added missing ${fullKey}`)
    }
  }
  return dict
}

async function loadDict() {
  if (!langs.includes(lang)) lang = defaultLang
  const promises = [loadJson(lang).then(r => dict = r)]
  let fallback: Dict | undefined
  if (defaultLang != lang && fallbackToDefault)
    promises.push(loadJson(defaultLang).then(r => fallback = r))
  await Promise.all(promises)
  if (fallback) mergeDicts(dict, fallback)
}

function loadJson(lang: string) {
  return fetch(`${jsonPath}${lang}.json${version ? '?' + version : ''}`).then(r => r.json())
}

function resolve(key: string, from: Record<string, any> = dict): any {
  const keys = key.split('.');
  let result = from;

  for (const k of keys) {
    if (!result || typeof result !== 'object') {
      return key; // Return the key if result is not an object or is null
    }

    const value = result[k];

    // If value is not an object or is null, return the value immediately
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    // Proceed to the next level
    result = value;
  }

  if (result && typeof result == 'object') {
    // After traversing the keys, check if the final result has a client-specific key or a default value
    if (clientIdentifier && result[clientIdentifier] !== undefined) {
      return result[clientIdentifier];
    } else if (result['default'] !== undefined) {
      return result['default'];
    } else {
      return key
    }
  }

  return result;
}

function replaceValues(text: string, values: Values) {
  return text.replace(/\{(.*?)}/g, (_, placeholder) => replacePlaceholder(placeholder, values))
}

function replacePlaceholder(text: string, values: Values) {
  const pluralTokens = text.split('|')
  const field = pluralTokens[0]
  if (pluralTokens.length == 1) return values[field] ?? field

  const key = new Intl.PluralRules(lang).select(values[field])
  const zeroKey = values[field] === 0 ? 'zero' : ''

  for (let i = 1; i < pluralTokens.length; i++) {
    const [candidateKey, candidateText] = pluralTokens[i].split(':', 2)
    if (candidateKey === key || candidateKey == zeroKey) return candidateText.replace('#', values[field])
  }
  return field
}
