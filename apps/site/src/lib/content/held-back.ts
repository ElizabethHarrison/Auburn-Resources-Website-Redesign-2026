/** The held-back and banned-wording list lives in the shared `@auburn/content-rules` package (one list for the site
 * and the Studio). Re-exported here so site code keeps one import path. */
export { HELD_BACK_PATTERNS, findHeldBack } from '@auburn/content-rules';
