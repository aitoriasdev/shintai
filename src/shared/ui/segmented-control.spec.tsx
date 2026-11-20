import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { SegmentedControl } from './segmented-control'

const options = [
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Completed' },
] as const

it('marks the selected option and reports changes', async () => {
  const onChange = vi.fn()
  const screen = await render(<SegmentedControl label="Filter" options={options} value="all" onChange={onChange} />)

  await expect.element(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true')
  await screen.getByRole('radio', { name: 'Completed' }).click()
  expect(onChange).toHaveBeenCalledWith('done')
})
