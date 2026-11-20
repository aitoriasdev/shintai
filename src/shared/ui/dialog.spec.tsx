import { domAnimation, LazyMotion } from 'motion/react'
import { expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import { Dialog } from './dialog'

function renderDialog(open: boolean, onClose = vi.fn()) {
  return render(
    <LazyMotion features={domAnimation}>
      <Dialog open={open} onClose={onClose} labelledBy="dialog-title">
        <h2 id="dialog-title">Game details</h2>
      </Dialog>
    </LazyMotion>,
  )
}

it('renders nothing when closed', async () => {
  const screen = await renderDialog(false)
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})

it('is named by its title and closes on Escape', async () => {
  const onClose = vi.fn()
  const screen = await renderDialog(true, onClose)

  await expect.element(screen.getByRole('dialog', { name: 'Game details' })).toBeVisible()
  await userEvent.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalled()
})
