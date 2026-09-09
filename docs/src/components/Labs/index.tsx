import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import type { Lab } from '@site/src/data/labs';
import ArrowRightIcon from '@site/static/img/arrow-right.svg';
import EducationIcon from '@site/static/img/education.svg';
import {
  formatDuration,
  launchUrl,
  resolveMiscLabs,
  resolveThirdPartyLabs,
  resolveTracks,
} from './catalogue';
import type { ResolvedTrack } from './catalogue';
import styles from './styles.module.css';

const externalLinkProps = { target: '_blank', rel: 'noopener noreferrer' } as const;

type LabCardProps = {
  lab: Lab;
  step?: number;
};

function LabCard({ lab, step }: LabCardProps) {
  const title = lab.docsUrl ? <Link to={lab.docsUrl}>{lab.title}</Link> : lab.title;

  return (
    <article className={styles.card} data-lab-id={lab.id}>
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

      <Heading as="h3" className={styles.cardTitle}>
        {title}
      </Heading>
      <p className={styles.cardDescription}>{lab.description}</p>
      {!lab.docsUrl && lab.prerequisites && (
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

function LabGrid({ labs, numbered }: { labs: Lab[]; numbered: boolean }) {
  return (
    <div className={styles.labGrid}>
      {labs.map((lab, index) => (
        <LabCard key={lab.id} lab={lab} step={numbered ? index + 1 : undefined} />
      ))}
    </div>
  );
}

function TrackSection({ track }: { track: ResolvedTrack }) {
  const firstLab = track.labs[0];
  const labCount = track.labs.length;

  return (
    <section className={styles.track} data-track-id={track.id} aria-labelledby={`track-${track.id}`}>
      <div className={styles.trackHeader}>
        <div className={styles.trackHeading}>
          <Heading as="h2" id={`track-${track.id}`}>
            {track.title}
          </Heading>
          <p className={styles.trackDescription}>{track.description}</p>
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
      <LabGrid labs={track.labs} numbered />
    </section>
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

export function LearningTracks() {
  const tracks = resolveTracks();
  if (tracks.length === 0) {
    return null;
  }

  return (
    <section className={clsx('container', styles.section)} aria-labelledby="learning-tracks">
      <Heading as="h2" id="learning-tracks">
        Learning tracks
      </Heading>
      <p className={styles.sectionIntro}>
        Each track is a sequence of labs designed to be taken in order. Start with the first if you are new to
        Infrahub, or pick the track that matches where you are.
      </p>
      {tracks.map((track) => (
        <TrackSection key={track.id} track={track} />
      ))}
    </section>
  );
}

export function MiscLabs() {
  const labs = resolveMiscLabs();
  if (labs.length === 0) {
    return null;
  }

  return (
    <section className={clsx('container', styles.section)} aria-labelledby="more-labs">
      <Heading as="h2" id="more-labs">
        More OpsMill labs
      </Heading>
      <p className={styles.sectionIntro}>
        Standalone labs from OpsMill that sit outside the learning tracks. Take them in any order.
      </p>
      <LabGrid labs={labs} numbered={false} />
    </section>
  );
}

export function ThirdPartyLabs() {
  const labs = resolveThirdPartyLabs();
  if (labs.length === 0) {
    return null;
  }

  return (
    <section className={clsx('container', styles.section)} aria-labelledby="community-labs">
      <Heading as="h2" id="community-labs">
        Community and partner labs
      </Heading>
      <p className={styles.sectionIntro}>
        Labs built by partners and community members that use Infrahub alongside their own tools. OpsMill hosts
        them on Instruqt but does not author or support the content, so questions about a lab go to its owner.
      </p>
      <LabGrid labs={labs} numbered={false} />
    </section>
  );
}
