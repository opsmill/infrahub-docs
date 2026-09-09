import { labs, tracks, miscLabIds, thirdPartyLabIds } from '@site/src/data/labs';
import type { Lab, Track } from '@site/src/data/labs';

export type ResolvedTrack = Track & {
  labs: Lab[];
  totalMinutes: number;
};

const labsById = new Map(labs.map((lab) => [lab.id, lab]));

function resolveLabs(ids: string[]): Lab[] {
  return ids.map((id) => {
    const lab = labsById.get(id);
    if (!lab) {
      throw new Error(`labs.ts references unknown lab id "${id}"`);
    }
    return lab;
  }).filter((lab) => lab.status === 'active');
}

/** Tracks with their active labs resolved in stored order. Tracks left with no labs are dropped. */
export function resolveTracks(): ResolvedTrack[] {
  return tracks
    .map((track) => {
      const trackLabs = resolveLabs(track.labIds);
      return {
        ...track,
        labs: trackLabs,
        totalMinutes: trackLabs.reduce((sum, lab) => sum + lab.durationMinutes, 0),
      };
    })
    .filter((track) => track.labs.length > 0);
}

export function resolveMiscLabs(): Lab[] {
  return resolveLabs(miscLabIds);
}

export function resolveThirdPartyLabs(): Lab[] {
  return resolveLabs(thirdPartyLabIds);
}

/** The Instruqt URL a launch action opens: the named invite when one exists, else the public track. */
export function launchUrl(lab: Lab): string {
  return lab.inviteUrl ?? lab.trackUrl;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) {
    return `${remainder} min`;
  }
  if (remainder === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${remainder} min`;
}
