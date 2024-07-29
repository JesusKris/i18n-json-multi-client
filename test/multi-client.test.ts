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
import {_, init} from '../src/i18n.js'
import en from '../sample/en.json' assert {type: 'json'}
import fi from '../sample/fi.json' assert {type: 'json'}
import {expect} from "chai";


describe('multi-client', () => {
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

  it('should resolve default header in English if client-specific key is missing', async () => {
    await init({langs, dicts, clientIdentifier: undefined})

    expect(_("homepage.header")).to.equal("Welcome to our Portal")
  });

  it('should resolve client1 client-specific header in English', async () => {
    await init({langs, dicts, clientIdentifier: "client1"})

    expect(_("homepage.header")).to.equal("Welcome to our Client 1 Portal")
  });

  it('should resolve client2 client-specific header in English', async () => {
    await init({langs, dicts, clientIdentifier: "client2"})

    expect(_("homepage.header")).to.equal("Welcome to our Client 2 Portal")
  });

  it("should return translation key when default is not defined", async () => {
    await init(
      {
        langs: ["en"],
        dicts:
          {
            en: {
              faulty:
                {
                  client1: "Welcome to our Client 1 Portal",
                  client2: "Welcome to our Client 2 Portal"
                },
            }
          },
        clientIdentifier: "client3"
      })

    expect(_("faulty")).to.equal("faulty")
  })

  it('should resolve contact info in English', async () => {
    await init({langs, dicts})

    expect(_("contacts.email")).to.equal("Email")
    expect(_("contacts.phone")).to.equal("Phone")
    expect(_("contacts.address")).to.equal("Address")

  });

  it('should resolve client1 client-specific header in English and apply defined plural rules', async () => {
    await init(
      {
        langs: ["en"],
        dicts:
          {
            en: {
              header: {
                client1: 'Welcome to our Client1 {count|zero:nothing|one:Portal|other:# Portals}',
                client2: "Welcome to our Client2 Portal"
              }
            }
          },
        clientIdentifier: "client1"
      })

    expect(_("header", {count: 1})).to.equal("Welcome to our Client1 Portal")
    expect(_("header", {count: 3})).to.equal("Welcome to our Client1 3 Portals")
  });

  it('should resolve header in Finnish without client-specific structure', async () => {
    await init({langs, dicts, lang: "fi"})

    expect(_("homepage.header")).to.equal("Tervetuloa portaalimme")
  });

  it('should resolve contact info in Finnish', async () => {
    await init({langs, dicts, lang: "fi"})

    expect(_("contacts.email")).to.equal("Sähköposti")
    expect(_("contacts.phone")).to.equal("Puhelin")
    expect(_("contacts.address")).to.equal("Osoite")
  });
})
