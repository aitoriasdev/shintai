import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { showError } from '@/shared/lib/error-notifications'
import { ErrorToast } from './error-toast'

it('shows errors in an alert region until dismissed', async () => {
  const screen = await render(<ErrorToast />)
  showError('Could not save your change.')

  await expect.element(screen.getByRole('alert')).toHaveTextContent('Could not save your change.')
  await screen.getByRole('button', { name: 'Dismiss' }).click()
  await expect.element(screen.getByText('Could not save your change.')).not.toBeInTheDocument()
})
