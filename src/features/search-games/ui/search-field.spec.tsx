import { useState } from 'react'
import { expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import { SearchField } from './search-field'

function Controlled() {
  const [value, setValue] = useState('')
  return <SearchField value={value} onChange={setValue} placeholder="Search games" />
}

it('focuses with "/" and clears with the clear button', async () => {
  const screen = await render(<Controlled />)
  const input = screen.getByRole('searchbox', { name: 'Search games' })

  await userEvent.keyboard('/')
  await expect.element(input).toHaveFocus()

  await userEvent.keyboard('zelda')
  await expect.element(input).toHaveValue('zelda')

  await screen.getByRole('button', { name: 'Clear search' }).click()
  await expect.element(input).toHaveValue('')
})
