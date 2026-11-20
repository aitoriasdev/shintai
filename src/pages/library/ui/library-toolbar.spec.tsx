import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { DEFAULT_FILTERS } from '../model/filter-library'
import { LibraryToolbar } from './library-toolbar'

it('reports status and sort changes', async () => {
  const onChange = vi.fn()
  const screen = await render(<LibraryToolbar filters={DEFAULT_FILTERS} onChange={onChange} />)

  await screen.getByRole('radio', { name: 'Favorites' }).click()
  expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, status: 'favorites' })

  await screen.getByRole('combobox', { name: 'Sort by' }).selectOptions('Score')
  expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, sort: 'score' })
})
