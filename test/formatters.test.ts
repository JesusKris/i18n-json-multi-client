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

import {expect} from 'chai'
import {init, formatAmount, formatCurrency, formatDate, formatDateTime} from '../src/formatters.js'

describe('formatters', () => {
  before(() => {
    init('en-GB')
  })

  it('formatDate', () => {
    expect(formatDate('2021-06-02')).to.eq('02/06/2021')
  })

  it('formatDateTime', () => {
    expect(formatDateTime(undefined)).to.equal('')
    expect(formatDateTime(new Date())).to.contain(new Date().getFullYear().toString())
    expect(formatDateTime(123)).to.contain('1970')
    expect(formatDateTime('2020-01-01T10:23:45.010101')).to.eq('1/01/2020, 10:23:45')
  })

  it('formatAmount', () => {
    expect(formatAmount({amount: 123, currency: 'EUR'})).to.eq('€123.00')
    expect(formatAmount({amount: 456.567}, 'USD')).to.eq('US$456.57')
    expect(formatAmount(456.567, 'GBP')).to.eq('£456.57')
    expect(formatAmount(null as any, 'EUR')).to.eq('€0.00')
  })

  it('formatCurrency', () => {
    expect(formatCurrency('EUR')).to.eq('€')
    expect(formatCurrency('USD')).to.eq('US$')
  })
})
