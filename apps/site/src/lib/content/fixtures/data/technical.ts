/**
 * Resources, results and milestones. None exists in any source: the current website reports no
 * Mineral Resource figures, no results with announcements, and no current milestones (its Hawkwood work
 * plan is outdated and not published). These lists stay empty until approved records are entered in
 * the CMS; the dossier modules render nothing (production) or INPUT NEEDED (preview).
 */
import type { ProjectMilestone, ResourceEstimate, ResultRecord } from '../../types';

export const resourceEstimates: readonly ResourceEstimate[] = [];
export const results: readonly ResultRecord[] = [];
export const milestones: readonly ProjectMilestone[] = [];
