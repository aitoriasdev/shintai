import { useState } from 'react'
import { expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import { SearchField } from './search-field'

function Controlled() {
  const [value, setValue] = useState('')
  return <SearchField value={value} onChange={setValue} label="Search games" />
}

it('is a search landmark with a labelled field and a keyboard shortcut', async () => {
  const screen = await render(<Controlled />)
  await expect.element(screen.getByRole('search')).toBeVisible()
  await expect.element(screen.getByRole('searchbox', { name: 'Search games' })).toHaveAttribute('aria-keyshortcuts', '/')
})

it('focuses with "/", clears with Escape and with the clear button', async () => {
  const screen = await render(<Controlled />)
  const input = screen.getByRole('searchbox', { name: 'Search games' })

  await userEvent.keyboard('/')
  await expect.element(input).toHaveFocus()
  await userEvent.keyboard('zelda')
  await expect.element(input).toHaveValue('zelda')
  await userEvent.keyboard('{Escape}')
  await expect.element(input).toHaveValue('')

  await userEvent.keyboard('hades')
  await screen.getByRole('button', { name: 'Clear search' }).click()
  await expect.element(input).toHaveValue('')
  await expect.element(input).toHaveFocus()
})
