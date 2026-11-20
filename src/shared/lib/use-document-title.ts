import { useEffect } from 'react'

const APP_NAME = 'Shintai'

/** 2.4.2 Page Titled: each view gets a descriptive title. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`
  }, [title])
}
