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
 */


import * as fs from 'fs'
import {mergeDicts} from './i18n.js'
import * as path from 'path'

function readJsonFile(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(outputPath: string, data: any) {
  fs.writeFileSync(outputPath, JSON.stringify(data), 'utf-8')
}

export function mergeLanguageFilesWithDefaultFallbacks(sourceDir: string, destinationDir: string) {
  fs.mkdirSync(destinationDir, {recursive: true})
  const langs = processFile(sourceDir, destinationDir, 'langs.json')
  console.log('Langs: ', langs)
  let noTranslate: Set<string> = new Set()
  try {
    noTranslate = new Set(readJsonFile(path.join(sourceDir, 'dont-translate-keys.json')))
    console.log('dont-translate-keys: ', noTranslate)
  } catch (e) {}
  const defaultDict = processFile(sourceDir, destinationDir, `${langs[0]}.json`)
  for (let i = 1; i < langs.length; i++) {
    const fileName = langs[i] + '.json'
    console.log(`compiling ` + fileName)
    processFile(sourceDir, destinationDir, fileName, dict => mergeDicts(dict, defaultDict, noTranslate))
  }
}

function processFile(src: string, dst: string, fileName: string, conversion: ((a: any) => any) = (a) => a) {
  let converted = conversion(readJsonFile(path.join(src, fileName)))
  writeJson(path.join(dst, fileName), converted)
  return converted
}
