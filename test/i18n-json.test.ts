/*
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
 * Author: ["Robert Kris Laur"]
 * Original Repository: ["https://github.com/JesusKris/i18n-json-multi-client.git"]
 */

import {describe} from "mocha";
import {_json, init} from '../src/i18n.js'
import en from '../sample/en.json' assert {type: 'json'}
import fi from '../sample/fi.json' assert {type: 'json'}
import {expect} from "chai";


describe('_json', () => {
  const langs = ["en", "fi"]
  const dicts = {en, fi}

  before(async () => {
    global.location = {host: 'hostname'} as Location
    global.document = {
      cookie: '', documentElement: {
        setAttribute: (name, value) => {
        }
      }
    } as Document
    global.navigator = {language: 'en-GB'} as Navigator
  })

  it('should return correct json object', async () => {
    await init({langs, dicts, clientIdentifier: undefined})

    const expectedJsonObject = {
      header: {
        client1: "Welcome to our Client 1 Portal",
        client2: "Welcome to our Client 2 Portal",
        default: "Welcome to our Portal"
      }
    };

    expect(_json("homepage")).to.deep.equal(expectedJsonObject)
  });

  it('should return key if json not found', async () => {
    await init({langs, dicts, clientIdentifier: undefined})

    expect(_json("hello")).to.eq("hello")
  });
})
