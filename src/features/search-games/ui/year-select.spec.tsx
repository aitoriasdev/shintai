import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { YearSelect } from './year-select'

it('offers every year from now back to 1970 and reports the choice', async () => {
  const onChange = vi.fn()
  const screen = await render(<YearSelect value={null} onChange={onChange} />)
  const select = screen.getByRole('combobox', { name: 'Release year' })

  await select.selectOptions('1998')
  expect(onChange).toHaveBeenLastCalledWith(1998)
  await select.selectOptions('Any year')
  expect(onChange).toHaveBeenLastCalledWith(null)

  const options = (select.element() as HTMLSelectElement).options
  expect(options[1].value).toBe(String(new Date().getFullYear()))
  expect(options[options.length - 1].value).toBe('1970')
})
