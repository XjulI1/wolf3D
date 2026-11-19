import { describe, expect, it } from 'vitest'
import { formatRatio, formatScore, formatTime } from './format'

describe('formatScore', () => {
  it('pads the score to six digits, like an arcade counter', () => {
    expect(formatScore(1200)).toBe('001200')
    expect(formatScore(1234567)).toBe('1234567')
  })
})

describe('formatTime', () => {
  it('shows minutes and seconds', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(75.9)).toBe('1:15')
    expect(formatTime(600)).toBe('10:00')
  })
})

describe('formatRatio', () => {
  it('rounds to a whole percentage, in French typography', () => {
    expect(formatRatio(2, 3)).toBe('67 %')
    expect(formatRatio(0, 4)).toBe('0 %')
  })

  it('counts nothing to find as everything found', () => {
    expect(formatRatio(0, 0)).toBe('100 %')
  })
})
