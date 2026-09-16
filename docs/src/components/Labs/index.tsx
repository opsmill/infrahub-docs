import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import type { Lab } from '@site/src/data/labs';
import ArrowRightIcon from '@site/static/img/arrow-right.svg';
import EducationIcon from '@site/static/img/education.svg';
import {
  allLabsWithContext,
  countSelected,
  EMPTY_FILTERS,
  FACETS,
  filtersFromQuery,
  filtersToQuery,
  formatDuration,
  isFiltered,
  launchUrl,
  matchesFilters,
  optionCounts,
  resolveSections,
  toggleFilter,
} from './catalogue';
import type { Filters, LabContext, ResolvedSection, ResolvedTrack } from './catalogue';
import styles from './styles.module.css';

const externalLinkProps = { target: '_blank', rel: 'noopener noreferrer' } as const;

type LabCardProps = {
  lab: Lab;
  /** Position inside a track. Omitted for standalone labs. */
  step?: number;
  /** Shown in the filtered view so a lab keeps its place in the catalogue. */
  context?: LabContext;
};

function LabCard({ lab, step, context }: LabCardProps) {
  const title = lab.docsUrl ? <Link to={lab.docsUrl}>{lab.title}</Link> : lab.title;
  // Inside a track the step number already says what comes first.
  const showPrerequisites = step === undefined && Boolean(lab.prerequisites);

  return (
    <article className={styles.card} data-lab-id={lab.id}>
      {(step !== undefined || lab.owner) && (
        <div className={styles.cardTop}>
          {step !== undefined && (
            <span className={styles.step} aria-label={`Step ${step}`}>
              {step}
            </span>
          )}
          {lab.owner && (
            <span className={clsx(styles.chip, styles.owner)}>
              {lab.owner.url ? (
                <Link to={lab.owner.url} {...externalLinkProps}>
                  {lab.owner.name}
                </Link>
              ) : (
                lab.owner.name
              )}
            </span>
          )}
        </div>
      )}

      {context && (
        <p className={styles.context}>
          {context.sectionTitle}
          {context.step !== undefined && ` · Step ${context.step}`}
        </p>
      )}

      <Heading as="h3" className={styles.cardTitle}>
        {title}
      </Heading>
      <p className={styles.cardDescription}>{lab.description}</p>
      {showPrerequisites && (
        <p className={styles.prerequisites}>
          <strong>Prerequisites:</strong> {lab.prerequisites}
        </p>
      )}

      <div className={styles.cardMeta}>
        <span className={styles.chip}>{formatDuration(lab.durationMinutes)}</span>
        <span className={styles.chip}>{lab.level}</span>
      </div>

      <div className={styles.cardActions}>
        <Link
          className={clsx(styles.launchButton, 'button button--primary button--sm')}
          to={launchUrl(lab)}
          {...externalLinkProps}
        >
          Start lab
          <ArrowRightIcon />
        </Link>
        {lab.docsUrl && (
          <Link className={styles.learnMore} to={lab.docsUrl}>
            Learn more
          </Link>
        )}
      </div>
    </article>
  );
}

function TrackBlock({ track }: { track: ResolvedTrack }) {
  const firstLab = track.labs[0];
  const labCount = track.labs.length;

  return (
    <section className={styles.track} data-section-id={track.id} aria-labelledby={`section-${track.id}`}>
      <div className={styles.trackHeader}>
        <div className={styles.trackHeading}>
          <Heading as="h2" id={`section-${track.id}`}>
            {track.title}
          </Heading>
          <p className={styles.sectionDescription}>{track.description}</p>
          <div className={styles.trackMeta}>
            <span className={styles.chip}>
              {labCount} {labCount === 1 ? 'lab' : 'labs'}
            </span>
            <span className={styles.chip}>about {formatDuration(track.totalMinutes)}</span>
          </div>
        </div>
        <div className={styles.trackActions}>
          <Link
            className={clsx(styles.launchButton, 'button button--primary')}
            to={launchUrl(firstLab)}
            {...externalLinkProps}
          >
            Start track
            <ArrowRightIcon />
          </Link>
          {track.docsUrl && (
            <Link className="button button--secondary" to={track.docsUrl}>
              About this track
            </Link>
          )}
        </div>
      </div>
      <div
        className={clsx(styles.labGrid, styles.trackGrid)}
        style={{ '--track-columns': labCount } as React.CSSProperties}
      >
        {track.labs.map((lab, index) => (
          <LabCard key={lab.id} lab={lab} step={index + 1} />
        ))}
      </div>
    </section>
  );
}

function GroupBlock({ group }: { group: Extract<ResolvedSection, { kind: 'group' }> }) {
  return (
    <section className={styles.group} data-section-id={group.id} aria-labelledby={`section-${group.id}`}>
      <Heading as="h2" id={`section-${group.id}`}>
        {group.title}
      </Heading>
      <p className={styles.sectionDescription}>{group.description}</p>
      <div className={styles.labGrid}>
        {group.labs.map((lab) => (
          <LabCard key={lab.id} lab={lab} />
        ))}
      </div>
    </section>
  );
}

function FilterSidebar({
  filters,
  onToggle,
  onClear,
}: {
  filters: Filters;
  onToggle: (facetId: (typeof FACETS)[number]['id'], value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedCount = countSelected(filters);

  return (
    <aside className={clsx(styles.sidebar, open && styles.sidebarOpen)}>
      <button
        type="button"
        className={clsx(styles.filterToggle, 'button button--secondary')}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Hide filters' : 'Show filters'}
        {selectedCount > 0 && <span className={styles.toggleCount}>{selectedCount}</span>}
      </button>

      <div className={styles.sidebarPanel}>
        <div className={styles.sidebarHeader}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M3 6h18v2H3zm4 5h10v2H7zm3 5h4v2h-4z"
            />
          </svg>
          <Heading as="h2" className={styles.sidebarTitle}>
            Narrow your search
          </Heading>
        </div>

        {FACETS.map((facet) => {
          const counts = optionCounts(filters, facet.id);
          return (
            <fieldset key={facet.id} className={styles.facet}>
              <legend className={styles.facetLegend}>{facet.legend}</legend>
              {facet.options.map((option) => {
                const checked = filters[facet.id].includes(option.value);
                const count = counts[option.value] ?? 0;
                return (
                  <label
                    key={option.value}
                    className={clsx(styles.facetOption, count === 0 && !checked && styles.facetEmpty)}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(facet.id, option.value)}
                    />
                    <span className={styles.facetLabel}>{option.label}</span>
                    <span className={styles.facetCount}>{count}</span>
                  </label>
                );
              })}
            </fieldset>
          );
        })}

        {selectedCount > 0 && (
          <button type="button" className={styles.clearAll} onClick={onClear}>
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}

export function LabsHero() {
  return (
    <header className={clsx('container', styles.hero)}>
      <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
        Labs
      </Heading>
      <p className={styles.heroSubtitle}>
        Learn Infrahub by doing real work in a live environment. Pick a track to follow a guided sequence, or
        jump into a single lab on the topic you need.
      </p>
      <p className={styles.heroNote}>
        <EducationIcon />
        Every lab runs in your browser on Instruqt with Infrahub already provisioned. Nothing to install.
      </p>
    </header>
  );
}

export function LabsBrowser() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const hydrated = useRef(false);

  const sections = useMemo(() => resolveSections(), []);
  const withContext = useMemo(() => allLabsWithContext(), []);
  const totalLabs = withContext.length;

  // Read filters from the URL once, after mount, so the server-rendered markup
  // and the first client render agree.
  useEffect(() => {
    const fromUrl = filtersFromQuery(window.location.search);
    if (isFiltered(fromUrl)) {
      setFilters(fromUrl);
    }
    hydrated.current = true;
  }, []);

  // Keep the URL shareable as filters change, without adding history entries.
  useEffect(() => {
    if (!hydrated.current) {
      return;
    }
    const query = filtersToQuery(filters);
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [filters]);

  const filtering = isFiltered(filters);
  const matches = useMemo(
    () => withContext.filter(({ lab }) => matchesFilters(lab, filters)),
    [withContext, filters],
  );

  const clear = () => setFilters(EMPTY_FILTERS);

  return (
    <div className={clsx('container', styles.layout)}>
      <FilterSidebar
        filters={filters}
        onToggle={(facetId, value) => setFilters((current) => toggleFilter(current, facetId, value))}
        onClear={clear}
      />

      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <p className={styles.resultsCount} aria-live="polite">
            {filtering ? `Showing ${matches.length} of ${totalLabs} labs` : `All ${totalLabs} labs`}
          </p>
          {filtering && (
            <button type="button" className={styles.clearInline} onClick={clear}>
              Clear all filters
            </button>
          )}
        </div>

        {filtering ? (
          matches.length > 0 ? (
            <div className={styles.labGrid}>
              {matches.map(({ lab, context }) => (
                <LabCard key={lab.id} lab={lab} context={context} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              No labs match those filters. Try removing one, or{' '}
              <button type="button" className={styles.clearInline} onClick={clear}>
                clear all filters
              </button>
              .
            </p>
          )
        ) : (
          sections.map((section) =>
            section.kind === 'track' ? (
              <TrackBlock key={section.id} track={section} />
            ) : (
              <GroupBlock key={section.id} group={section} />
            ),
          )
        )}
      </div>
    </div>
  );
}
