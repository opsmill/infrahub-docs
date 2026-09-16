import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

/** Everything the details dialog renders, whether it came from a lab or a track. */
type Details = {
  /** Small line above the title: where this sits in the catalogue. */
  kicker?: string;
  title: string;
  /** Short strings rendered as chips: duration, level, lab count. */
  meta: string[];
  owner?: Lab['owner'];
  overview: string;
  whatYouWillLearn: string[];
  prerequisites?: string;
  launchUrl: string;
  launchLabel: string;
};

function labDetails(lab: Lab, context?: LabContext): Details {
  const kickerParts: string[] = [];
  if (context) {
    kickerParts.push(context.sectionTitle);
    if (context.step !== undefined) {
      kickerParts.push(`Step ${context.step}`);
    }
  }
  return {
    kicker: kickerParts.join(' · ') || undefined,
    title: lab.title,
    meta: [formatDuration(lab.durationMinutes), lab.level],
    owner: lab.owner,
    overview: lab.overview,
    whatYouWillLearn: lab.whatYouWillLearn,
    prerequisites: lab.prerequisites,
    launchUrl: launchUrl(lab),
    launchLabel: 'Start lab',
  };
}

function trackDetails(track: ResolvedTrack): Details {
  return {
    kicker: 'Learning track',
    title: track.title,
    meta: [
      `${track.labs.length} ${track.labs.length === 1 ? 'lab' : 'labs'}`,
      `about ${formatDuration(track.totalMinutes)}`,
    ],
    overview: track.overview,
    whatYouWillLearn: track.whatYouWillLearn,
    prerequisites: track.prerequisites,
    launchUrl: launchUrl(track.labs[0]),
    launchLabel: 'Start track',
  };
}

const ShowDetailsContext = createContext<(details: Details) => void>(() => {});

// --- Dialog ----------------------------------------------------------------

function DetailsDialog({ details, onClose }: { details: Details | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (details && !dialog.open) {
      dialog.showModal();
    } else if (!details && dialog.open) {
      dialog.close();
    }
  }, [details]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="lab-details-title"
      // Fires for Esc as well as an explicit close(), so state stays in step.
      onClose={onClose}
      // The dialog element itself is only the area around the panel.
      onClick={(event) => {
        if (event.target === ref.current) {
          onClose();
        }
      }}
    >
      {details && (
        <div className={styles.dialogPanel}>
          <button type="button" className={styles.dialogClose} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>

          {details.kicker && <p className={styles.dialogKicker}>{details.kicker}</p>}
          <Heading as="h2" id="lab-details-title" className={styles.dialogTitle}>
            {details.title}
          </Heading>

          <div className={styles.cardMeta}>
            {details.meta.map((item) => (
              <span key={item} className={styles.chip}>
                {item}
              </span>
            ))}
            {details.owner && (
              <span className={clsx(styles.chip, styles.owner)}>
                {details.owner.url ? (
                  <Link to={details.owner.url} {...externalLinkProps}>
                    {details.owner.name}
                  </Link>
                ) : (
                  details.owner.name
                )}
              </span>
            )}
          </div>

          <p className={styles.dialogOverview}>{details.overview}</p>

          {details.whatYouWillLearn.length > 0 && (
            <>
              <Heading as="h3" className={styles.dialogSubheading}>
                What you&rsquo;ll learn
              </Heading>
              <ul className={styles.dialogList}>
                {details.whatYouWillLearn.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {details.prerequisites && (
            <p className={styles.dialogPrerequisites}>
              <strong>Prerequisites:</strong> {details.prerequisites}
            </p>
          )}

          <div className={styles.dialogActions}>
            <Link
              className={clsx(styles.launchButton, 'button button--primary')}
              to={details.launchUrl}
              {...externalLinkProps}
            >
              {details.launchLabel}
              <ArrowRightIcon />
            </Link>
            <button type="button" className="button button--secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

// --- Cards and sections ----------------------------------------------------

type LabCardProps = {
  lab: Lab;
  /** Position inside a track. Omitted for standalone labs. */
  step?: number;
  /** Where this lab sits in the catalogue. Always passed to the dialog. */
  context?: LabContext;
  /**
   * Print the context on the card itself. Only the filtered view needs it:
   * elsewhere the card already sits under its own section heading.
   */
  showContextLine?: boolean;
};

function LabCard({ lab, step, context, showContextLine }: LabCardProps) {
  const showDetails = useContext(ShowDetailsContext);
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

      {showContextLine && context && (
        <p className={styles.context}>
          {context.sectionTitle}
          {context.step !== undefined && ` · Step ${context.step}`}
        </p>
      )}

      <Heading as="h3" className={styles.cardTitle}>
        {lab.title}
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
        <button
          type="button"
          className={styles.detailsButton}
          onClick={() => showDetails(labDetails(lab, context))}
        >
          Details
        </button>
      </div>
    </article>
  );
}

function TrackBlock({ track }: { track: ResolvedTrack }) {
  const showDetails = useContext(ShowDetailsContext);
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
          <button
            type="button"
            className="button button--secondary"
            onClick={() => showDetails(trackDetails(track))}
          >
            About this track
          </button>
        </div>
      </div>
      <div
        className={clsx(styles.labGrid, styles.trackGrid)}
        style={{ '--track-columns': labCount } as React.CSSProperties}
      >
        {track.labs.map((lab, index) => (
          <LabCard
            key={lab.id}
            lab={lab}
            step={index + 1}
            context={{ sectionTitle: track.title, step: index + 1 }}
          />
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
          <LabCard key={lab.id} lab={lab} context={{ sectionTitle: group.title }} />
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
            <path fill="currentColor" d="M3 6h18v2H3zm4 5h10v2H7zm3 5h4v2h-4z" />
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
  const [details, setDetails] = useState<Details | null>(null);
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
    <ShowDetailsContext.Provider value={setDetails}>
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
                  <LabCard key={lab.id} lab={lab} context={context} showContextLine />
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

      <DetailsDialog details={details} onClose={() => setDetails(null)} />
    </ShowDetailsContext.Provider>
  );
}
