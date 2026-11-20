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

it('stays announced and dismissible while a dialog makes the app root inert', async () => {
  const appRoot = document.createElement('div')
  appRoot.id = 'root'
  appRoot.setAttribute('inert', '')
  document.body.append(appRoot)

  const screen = await render(<ErrorToast />, { container: appRoot })
  showError('Could not save your change.')

  const alert = screen.getByRole('alert')
  await expect.element(alert).toHaveTextContent('Could not save your change.')
  expect(alert.element().closest('[inert]')).toBeNull()
  await screen.getByRole('button', { name: 'Dismiss' }).click()
  await expect.element(screen.getByText('Could not save your change.')).not.toBeInTheDocument()
  appRoot.remove()
})
