import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useWhenIdle } from './use-when-idle'

function Probe({ onIdle }: { onIdle: () => void }) {
  useWhenIdle(onIdle, 200)
  return null
}

it('runs the callback once the browser is idle', async () => {
  const onIdle = vi.fn()
  await render(<Probe onIdle={onIdle} />)
  await expect.poll(() => onIdle.mock.calls.length).toBe(1)
})

it('does not run after unmounting first', async () => {
  const onIdle = vi.fn()
  const screen = await render(<Probe onIdle={onIdle} />)
  await screen.unmount()
  await new Promise((resolve) => setTimeout(resolve, 300))
  expect(onIdle).not.toHaveBeenCalled()
})
