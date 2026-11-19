import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BriefingOverlay from './BriefingOverlay.vue'
import DeathOverlay from './DeathOverlay.vue'
import LevelSummary from './LevelSummary.vue'

const report = { kills: 3, enemies: 4, data: 1, totalData: 2, time: 95 }

describe('LevelSummary', () => {
  it('sums up the level', () => {
    const wrapper = mount(LevelSummary, { props: { report, levelName: 'Le Noyau', score: 4300, victory: false } })
    expect(wrapper.get('[data-test="kills"]').text()).toBe('75 %')
    expect(wrapper.get('[data-test="data"]').text()).toBe('50 %')
    expect(wrapper.get('[data-test="time"]').text()).toBe('1:35')
    expect(wrapper.get('[data-test="score"]').text()).toBe('004300')
    expect(wrapper.get('[data-test="next"]').text()).toBe('Niveau suivant')
  })

  it('offers to play again after the last level', async () => {
    const wrapper = mount(LevelSummary, { props: { report, levelName: 'Le Noyau', score: 4300, victory: true } })
    expect(wrapper.text()).toContain('Mission accomplie')
    await wrapper.get('[data-test="next"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })
})

describe('BriefingOverlay', () => {
  it('introduces the level, and mentions the keycard only where doors are locked', () => {
    const plain = mount(BriefingOverlay, {
      props: { levelNumber: 1, levelName: 'Quai de chargement', paused: false, hasLockedDoors: false },
    })
    expect(plain.text()).toContain('Niveau 1')
    expect(plain.text()).not.toContain('carte d’accès')
    const locked = mount(BriefingOverlay, {
      props: { levelNumber: 2, levelName: 'Salle des serveurs', paused: false, hasLockedDoors: true },
    })
    expect(locked.text()).toContain('carte d’accès')
  })

  it('resumes from the pause', async () => {
    const wrapper = mount(BriefingOverlay, {
      props: { levelNumber: 1, levelName: 'Quai de chargement', paused: true, hasLockedDoors: false },
    })
    expect(wrapper.get('[data-test="play"]').text()).toBe('Reprendre')
    await wrapper.get('[data-test="play"]').trigger('click')
    await wrapper.get('[data-test="quit"]').trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
    expect(wrapper.emitted('quit')).toHaveLength(1)
  })
})

describe('DeathOverlay', () => {
  it('offers to retry the level', async () => {
    const wrapper = mount(DeathOverlay)
    await wrapper.get('[data-test="retry"]').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
