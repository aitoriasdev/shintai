import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { Dialog } from './dialog'

let appRoot: HTMLDivElement

beforeEach(() => {
  appRoot = document.createElement('div')
  appRoot.id = 'root'
  appRoot.innerHTML = '<button type="button">Behind the dialog</button>'
  document.body.prepend(appRoot)
})

afterEach(() => appRoot.remove())

function renderDialog(open: boolean, onClose = vi.fn()) {
  return renderWithProviders(
    <Dialog open={open} onClose={onClose} labelledBy="dialog-title">
      <h2 id="dialog-title">Game details</h2>
      <button type="button">Inside</button>
    </Dialog>,
  )
}

it('renders nothing when closed', async () => {
  const screen = await renderDialog(false)
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
  expect(appRoot.hasAttribute('inert')).toBe(false)
})

it('is a named modal that takes focus and makes the page behind it inert', async () => {
  const screen = await renderDialog(true)
  const dialog = screen.getByRole('dialog', { name: 'Game details' })

  await expect.element(dialog).toHaveAttribute('aria-modal', 'true')
  await expect.element(dialog).toHaveFocus()
  expect(appRoot.hasAttribute('inert')).toBe(true)
})

it('falls back to the main content when the opener is gone (2.4.3)', async () => {
  const main = document.createElement('main')
  main.tabIndex = -1
  appRoot.append(main)
  const opener = appRoot.querySelector('button')!
  opener.focus()

  const screen = await renderDialog(true)
  opener.remove()
  await screen.rerender(
    <Dialog open={false} onClose={vi.fn()} labelledBy="dialog-title">
      {null}
    </Dialog>,
  )
  expect(document.activeElement).toBe(main)
})

it('closes on Escape and restores the page', async () => {
  const onClose = vi.fn()
  const screen = await renderDialog(true, onClose)
  await userEvent.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalled()

  await screen.rerender(
    <Dialog open={false} onClose={onClose} labelledBy="dialog-title">
      {null}
    </Dialog>,
  )
  expect(appRoot.hasAttribute('inert')).toBe(false)
})
