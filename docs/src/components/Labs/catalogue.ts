import { labs, sections, TOPICS } from '@site/src/data/labs';
import type { GroupSection, Lab, Section, TrackSection } from '@site/src/data/labs';

/** A track with its active labs resolved, in learning order. */
export type ResolvedTrack = TrackSection & {
  labs: Lab[];
  totalMinutes: number;
};

/** A group with its active labs resolved. */
export type ResolvedGroup = GroupSection & {
  labs: Lab[];
};

export type ResolvedSection = ResolvedTrack | ResolvedGroup;

/** Where a lab sits in the curated view, shown on cards in the filtered view. */
export type LabContext = {
  sectionTitle: string;
  /** 1-based position, tracks only. */
  step?: number;
};

const labsById = new Map(labs.map((lab) => [lab.id, lab]));

function resolveLabs(ids: string[]): Lab[] {
  return ids
    .map((id) => {
      const lab = labsById.get(id);
      if (!lab) {
        throw new Error(`labs.ts references unknown lab id "${id}"`);
      }
      return lab;
    })
    .filter((lab) => lab.status === 'active');
}

/** Sections in page order, with labs resolved. Sections left empty are dropped. */
export function resolveSections(): ResolvedSection[] {
  return sections
    .map((section: Section): ResolvedSection => {
      const sectionLabs = resolveLabs(section.labIds);
      if (section.kind === 'track') {
        return {
          ...section,
          labs: sectionLabs,
          totalMinutes: sectionLabs.reduce((sum, lab) => sum + lab.durationMinutes, 0),
        };
      }
      return { ...section, labs: sectionLabs };
    })
    .filter((section) => section.labs.length > 0);
}

/** Every active lab, in page order, with the section context it belongs to. */
export function allLabsWithContext(): { lab: Lab; context: LabContext }[] {
  const out: { lab: Lab; context: LabContext }[] = [];
  resolveSections().forEach((section) => {
    section.labs.forEach((lab, index) => {
      out.push({
        lab,
        context: {
          sectionTitle: section.title,
          step: section.kind === 'track' ? index + 1 : undefined,
        },
      });
    });
  });
  return out;
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

// --- Filters ---------------------------------------------------------------

export type FacetId = 'level' | 'topic' | 'duration' | 'author';

export type FacetOption = {
  value: string;
  label: string;
  /** True when the lab matches this option. */
  matches: (lab: Lab) => boolean;
};

export type Facet = {
  id: FacetId;
  legend: string;
  options: FacetOption[];
};

/** Selected option values per facet. An empty array means the facet is inactive. */
export type Filters = Record<FacetId, string[]>;

export const EMPTY_FILTERS: Filters = { level: [], topic: [], duration: [], author: [] };

export const FACETS: Facet[] = [
  {
    id: 'level',
    legend: 'Level',
    options: (['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => ({
      value: level.toLowerCase(),
      label: level,
      matches: (lab: Lab) => lab.level === level,
    })),
  },
  {
    id: 'topic',
    legend: 'Topic',
    options: Object.entries(TOPICS).map(([value, label]) => ({
      value,
      label,
      matches: (lab: Lab) => lab.topics.includes(value as keyof typeof TOPICS),
    })),
  },
  {
    id: 'duration',
    legend: 'Duration',
    options: [
      { value: 'short', label: '1 hour or less', matches: (lab: Lab) => lab.durationMinutes <= 60 },
      {
        value: 'medium',
        label: '1 to 2 hours',
        matches: (lab: Lab) => lab.durationMinutes > 60 && lab.durationMinutes <= 120,
      },
      { value: 'long', label: 'Over 2 hours', matches: (lab: Lab) => lab.durationMinutes > 120 },
    ],
  },
  {
    id: 'author',
    legend: 'Author',
    options: [
      { value: 'opsmill', label: 'OpsMill', matches: (lab: Lab) => lab.owner === undefined },
      {
        value: 'community',
        label: 'Community and partner',
        matches: (lab: Lab) => lab.owner !== undefined,
      },
    ],
  },
];

const facetsById = new Map(FACETS.map((facet) => [facet.id, facet]));

/** Within a facet a lab matches if it satisfies any selected option; across facets, all must hold. */
function matchesFacet(lab: Lab, facetId: FacetId, selected: string[]): boolean {
  if (selected.length === 0) {
    return true;
  }
  const facet = facetsById.get(facetId);
  if (!facet) {
    return true;
  }
  return facet.options.some((option) => selected.includes(option.value) && option.matches(lab));
}

export function matchesFilters(lab: Lab, filters: Filters): boolean {
  return FACETS.every((facet) => matchesFacet(lab, facet.id, filters[facet.id]));
}

export function isFiltered(filters: Filters): boolean {
  return FACETS.some((facet) => filters[facet.id].length > 0);
}

export function countSelected(filters: Filters): number {
  return FACETS.reduce((sum, facet) => sum + filters[facet.id].length, 0);
}

/**
 * How many labs each option would leave, given every other facet's selections.
 * A facet's own selections are ignored for its own counts, so ticking a second
 * box in the same group never shows zero for options that are still reachable.
 */
export function optionCounts(filters: Filters, facetId: FacetId): Record<string, number> {
  const facet = facetsById.get(facetId);
  const counts: Record<string, number> = {};
  if (!facet) {
    return counts;
  }
  const candidates = labs.filter(
    (lab) =>
      lab.status === 'active' &&
      FACETS.filter((other) => other.id !== facetId).every((other) =>
        matchesFacet(lab, other.id, filters[other.id]),
      ),
  );
  facet.options.forEach((option) => {
    counts[option.value] = candidates.filter((lab) => option.matches(lab)).length;
  });
  return counts;
}

export function toggleFilter(filters: Filters, facetId: FacetId, value: string): Filters {
  const current = filters[facetId];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  return { ...filters, [facetId]: next };
}

// --- URL sync --------------------------------------------------------------

/** Serialise filters to a query string (without "?"). Empty when nothing is selected. */
export function filtersToQuery(filters: Filters): string {
  const params = new URLSearchParams();
  FACETS.forEach((facet) => {
    const selected = filters[facet.id];
    if (selected.length > 0) {
      params.set(facet.id, selected.join(','));
    }
  });
  return params.toString();
}

/** Parse filters from a query string, discarding values this build does not know. */
export function filtersFromQuery(search: string): Filters {
  const params = new URLSearchParams(search);
  const parsed: Filters = { ...EMPTY_FILTERS };
  FACETS.forEach((facet) => {
    const raw = params.get(facet.id);
    if (!raw) {
      return;
    }
    const known = new Set(facet.options.map((option) => option.value));
    parsed[facet.id] = raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => known.has(value));
  });
  return parsed;
}
