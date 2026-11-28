import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { useHasBeenTruthy } from './use-has-been-truthy'

function Probe({ value }: { value: unknown }) {
  return <output>{String(useHasBeenTruthy(value))}</output>
}

it('turns true on the first truthy value and stays true', async () => {
  const screen = await render(<Probe value={null} />)
  await expect.element(screen.getByRole('status')).toHaveTextContent('false')
  await screen.rerender(<Probe value="Celeste" />)
  await expect.element(screen.getByRole('status')).toHaveTextContent('true')
  await screen.rerender(<Probe value={null} />)
  await expect.element(screen.getByRole('status')).toHaveTextContent('true')
})
