import { useState } from 'react'
import { expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import { SegmentedControl } from './segmented-control'

const options = [
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Completed' },
  { value: 'fav', label: 'Favorites' },
] as const

it('is a labelled radio group that reports changes', async () => {
  const onChange = vi.fn()
  const screen = await render(<SegmentedControl label="Status" options={options} value="all" onChange={onChange} />)

  await expect.element(screen.getByRole('group', { name: 'Status' })).toBeVisible()
  await expect.element(screen.getByRole('radio', { name: 'All' })).toBeChecked()
  await screen.getByRole('radio', { name: 'Completed' }).click()
  expect(onChange).toHaveBeenCalledWith('done')
})

it('supports arrow-key navigation (2.1.1)', async () => {
  function Controlled() {
    const [value, setValue] = useState<'all' | 'done' | 'fav'>('all')
    return <SegmentedControl label="Status" options={options} value={value} onChange={setValue} />
  }
  const screen = await render(<Controlled />)

  await userEvent.tab()
  await expect.element(screen.getByRole('radio', { name: 'All' })).toHaveFocus()
  await userEvent.keyboard('{ArrowRight}')
  await expect.element(screen.getByRole('radio', { name: 'Completed' })).toBeChecked()
  await userEvent.keyboard('{ArrowRight}')
  await expect.element(screen.getByRole('radio', { name: 'Favorites' })).toBeChecked()
})
