/** Motion's animation features load after the first paint; until then `m.*` components render without animating. */
export const loadMotionFeatures = () => import('./motion-features').then((module) => module.default)
