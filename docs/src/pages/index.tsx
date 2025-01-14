import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading'
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import {translate} from '@docusaurus/Translate';
import ArrowRightIcon from "/img/arrow-right.svg";
import EducationIcon from "/img/education.svg";

function HomepageHeader() {
    const {siteConfig} = useDocusaurusContext();

    return (
        <header className={clsx('container', styles.heroBanner)}>
            <div className="col col--6">
                <Heading as="h1" className="hero__title">{siteConfig.title}</Heading>
                <p className="hero__subtitle">
                    {translate({
                        id: 'home.header.subtitle',
                        message: "Simplify Infrastructure Automation",
                    })}
                </p>

                <div className={styles.containerFlexWrap}>
                        <Link
                            className={clsx(styles.heroButton, "button button--primary button--lg")}
                            to="/docs/"
                        >
                            {translate({
                                id: 'home.header.docs',
                                message: 'Learn about Infrahub',
                            })}

                            <ArrowRightIcon/>
                        </Link>
                        <Link
                            className={clsx(styles.heroButton, "button button--secondary button--lg")}
                            to="https://demo.infrahub.app/"
                        >
                            {translate({
                                id: 'home.header.sandbox',
                                message: 'Try it',
                            })}
                            <ArrowRightIcon/>
                        </Link>
                    <Link
                        className={clsx(styles.heroButton, "button button--secondary button--lg")}
                        to="https://opsmill.instruqt.com/pages/labs"
                    >
                        {translate({
                            id: 'home.header.tutorials',
                            message: 'Infrahub Labs',
                        })}
                        <EducationIcon/>
                    </Link>
                </div>
            </div>

            <div className={clsx(styles.infrahubVideo, "col col--6")}>
                <video
                    style={{
                        pointerEvents: "none",
                        padding: "1px",
                    }}
                    className="rounded-2xl" height="100%" loop autoPlay muted>
                    <source src="/medias/demo.mp4" type="video/mp4"/>
                </video>
            </div>
        </header>
    );
}

type SectionItem = {
    title: string;
    svgPath: string;
    description: React.ReactNode;
    link: string;
};

function IntegrationCard({title, svgPath, description, link}: SectionItem) {
    return (
        <div className='col col--4 margin-bottom--md'>
            <Link to={link} className={clsx(styles.heroCard, "card text--no-decoration")}>
                <div className={clsx("card__header", styles.cardTitle)}>
                    <img src={svgPath} width="24px" alt="python logo"/>
                    <Heading as="h3">{title}</Heading>
                </div>

                <div className="card__body">{description}</div>
            </Link>
        </div>)
}

function IntegrationsSection() {
    return (
        <section className="container">
            <Heading as="h2">{translate({
                id: 'home.section.integrations.title',
                message: 'Integrations',
            })}</Heading>

            <div className="row">
                <IntegrationCard
                title="Ansible"
                 svgPath="/img/ansible.svg"
                 description="OpsMill maintains the opsmill.infrahub Ansible Collection."
                 link="/docs/integrations/infrahub-ansible"/>
                <IntegrationCard title="Nornir"
                                 svgPath="/img/nornir.png"
                                 description="Infrahub can be used as an inventory source for Nornir."
                                 link="/docs/integrations/nornir-infrahub"/>
                <IntegrationCard title="Infrahub Sync"
                                 svgPath="/img/sync.svg"
                                 description="A versatile Python package that synchronizes data between a source and a destination system."
                                 link="/docs/integrations/sync"/>
            </div>
        </section>
    );
}

export default function Home(): React.JSX.Element {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Simplify infrastructure automation"
        >
            <HomepageHeader/>
            <main>
                <IntegrationsSection/>
            </main>
        </Layout>
    );
}