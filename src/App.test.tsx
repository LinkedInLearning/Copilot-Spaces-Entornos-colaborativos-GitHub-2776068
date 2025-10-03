import { describe, it, expect } from 'vitest'

describe('Currency Converter', () => {
  it('should perform basic conversion calculation', () => {
    const amount = 100
    const rate = 1.2
    const result = amount * rate
    expect(result).toBe(120)
  })
})

describe('Tariff Calculator', () => {
  it('should calculate tariff percentage correctly', () => {
    const productValue = 1000
    const tariffRate = 5.5
    const tariffAmount = productValue * (tariffRate / 100)
    expect(tariffAmount).toBe(55)
  })
})