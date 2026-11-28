/**
 * True in the hosted demo (`yarn build:vercel` sets VITE_DEMO): each visitor's library lives in their browser and covers
 * are resized by Vercel. False in the local app, where both go through the local API.
 */
export const IS_DEMO = import.meta.env.VITE_DEMO === 'true'
