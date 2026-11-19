import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { HudState } from '../../game/hud'
import StatusBar from './StatusBar.vue'

const hud = (overrides: Partial<HudState> = {}): HudState => ({
  levelNumber: 2,
  levelName: 'Salle des serveurs',
  health: 100,
  ammo: 8,
  score: 1200,
  weapon: 'pistol',
  weapons: ['pistol'],
  hasKeycard: false,
  kills: 0,
  enemies: 8,
  ...overrides,
})

describe('StatusBar', () => {
  it('shows the score as an arcade counter, the health and the ammo', () => {
    const wrapper = mount(StatusBar, { props: { hud: hud() } })
    expect(wrapper.get('[data-test="score"]').text()).toBe('001200')
    expect(wrapper.get('[data-test="health"]').text()).toBe('100 %')
    expect(wrapper.get('[data-test="ammo"]').text()).toBe('8')
    expect(wrapper.get('[data-test="weapon"]').text()).toBe('Pistolet')
  })

  it('turns the health red when it runs low, and the ammo when it runs out', () => {
    const wrapper = mount(StatusBar, { props: { hud: hud({ health: 20, ammo: 0 }) } })
    expect(wrapper.get('[data-test="health"]').classes()).toContain('text-danger')
    expect(wrapper.get('[data-test="ammo"]').classes()).toContain('text-danger')
  })

  it('shows whether the keycard is in hand', () => {
    const without = mount(StatusBar, { props: { hud: hud() } })
    expect(without.get('[data-test="keycard"]').attributes('aria-label')).toBe('Pas de carte d’accès')
    const holding = mount(StatusBar, { props: { hud: hud({ hasKeycard: true }) } })
    expect(holding.get('[data-test="keycard"]').classes()).toContain('is-owned')
  })

  it('marks the owned weapons and the one in hand', () => {
    const wrapper = mount(StatusBar, { props: { hud: hud({ weapons: ['pistol', 'rifle'], weapon: 'rifle' }) } })
    const slots = wrapper.findAll('.slot')
    expect(slots.map((slot) => slot.classes('is-owned'))).toEqual([true, true])
    expect(slots.map((slot) => slot.classes('is-current'))).toEqual([false, true])
  })
})
