import { expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import { useHotkey } from './use-hotkey'

function Harness({ onSlash }: { onSlash: () => void }) {
  useHotkey('/', onSlash)
  return (
    <>
      <input aria-label="Name" />
      <label>
        <input type="radio" name="r" /> Option
      </label>
    </>
  )
}

it('fires from non-text controls such as radios, but not while typing', async () => {
  const onSlash = vi.fn()
  const screen = await render(<Harness onSlash={onSlash} />)

  await screen.getByRole('radio', { name: 'Option' }).click()
  await userEvent.keyboard('/')
  expect(onSlash).toHaveBeenCalledOnce()

  await screen.getByRole('textbox', { name: 'Name' }).click()
  await userEvent.keyboard('/')
  expect(onSlash).toHaveBeenCalledOnce()
})
