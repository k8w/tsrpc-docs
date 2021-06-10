import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';
import HomepageFeatures from '../components/HomepageFeatures';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className={"hero__title " + styles.title}>
          <img src="/img/logo.svg" className={styles.logo} />
          <img src="/img/text_logo.svg" className={styles.textLogo} />
        </h1>
        <p className={"hero__subtitle " + styles.subTitle}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={styles.normal}
            to="https://github.com/k8w/tsrpc">
            GitHub
          </Link>
          <Link
            className={styles.primary}
            to="/docs/introduction">
            快速开始
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      // title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
