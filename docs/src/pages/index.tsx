import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading'
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import Translate, { translate } from '@docusaurus/Translate';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">
          {translate({
            id: 'home.header.subtitle',
            message: 'Simplify Infrastructure Automation',
          })}
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/infrahub/"
          >
            {translate({
              id: 'home.header.docs',
              message: 'Infrahub Docs',
            })}
          </Link>
          <Link
            className="button button--info button--lg"
            to="https://opsmill.instruqt.com/pages/labs"
          >
            {translate({
              id: 'home.header.tutorials',
              message: 'Tutorials',
            })}
          </Link>
          <Link
            className="button button--info button--lg"
            to="https://demo.infrahub.app/"
          >
            {translate({
              id: 'home.header.sandbox',
              message: 'Sandbox',
            })}
          </Link>
        </div>
      </div>
    </header>
  );
}

type SectionItem = {
  title: string;
  Svg: string;
  description: React.JSX.Element;
  link: string;
};

// FIXME The SVG here (or all static files) cannot be loaded in i18n dev mode
const SectionList: SectionItem[] = [
  {
    title: translate({
      id: 'home.sectionList.development.title',
      message: 'Development',
    }),
    Svg: '/img/sdk.svg',
    description: (
      <Translate id="home.sectionList.development.description">
        {
          "These development packages such as the Infrahub Python SDK greatly simplify how you can interact with Infrahub programmatically."
        }
      </Translate>
    ),
    link: '/infrahub/python-sdk/',
  },
  {
    title: translate({
      id: 'home.sectionList.integrations.title',
      message: 'Integrations',
    }),
    Svg: '/img/integrations.svg',
    description: (
      <Translate id="home.sectionList.integrations.description">
        {'OpsMill maintains multiple integrations with other infrastructure systems. In addition, other companies maintain integrations with Infrahub.'}
      </Translate>
    ),
    link: '/infrahub/integrations/',
  },

  {
    title: translate({
      id: 'home.sectionList.demos.title',
      message: 'Demos',
    }),
    Svg: '/img/demos.svg',
    description: (
      <Translate id="home.sectionList.demos.description">
        {'These repositories demo key Infrahub features using example infrastructure. They demonstrate the capabilities to use Infrahub in various scenarios.'}
      </Translate>
    ),
    link: '/demo/',
  },
];

function Section({ title, Svg, description, link }: SectionItem) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={link}>
        <div className="text--center">
          <img className={styles.sectionSvg} style={{ width: '80px', height: '120px' }} src={Svg} alt="" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as='h4'>{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

function HomepageSections(): React.JSX.Element {
  return (
    <section className={styles.sections}>
      <div className="container">
        <div className="row">
          {SectionList.map((props, idx) => (
            <Section key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Simplify Infrastructure Automation"
    >
      <HomepageHeader />
      <main>
        <HomepageSections />
      </main>
    </Layout>
  );
}