import { useState } from 'react'
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { useInView } from './use-in-view'

function Sentinel() {
  const [visible, setVisible] = useState(false)
  const { ref, inView } = useInView<HTMLDivElement>('0px')
  return (
    <>
      <button type="button" onClick={() => setVisible(true)}>
        show
      </button>
      <output>{inView ? 'in view' : 'out of view'}</output>
      {visible && <div ref={ref} style={{ height: 10 }} />}
    </>
  )
}

it('observes an element that mounts after the first render', async () => {
  const screen = await render(<Sentinel />)
  await expect.element(screen.getByText('out of view')).toBeVisible()
  await screen.getByRole('button', { name: 'show' }).click()
  await expect.element(screen.getByText('in view', { exact: true })).toBeVisible()
})
