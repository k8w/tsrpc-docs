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
          {/* <img src="/img/logo.svg" className={styles.logo} /> */}
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
            to="/docs/introduction.html">
            快速入门
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
      description="TSRPC 是专为 TypeScript 设计的全栈 RPC 框架，适用于 HTTP API、WebSocket 实时应用、NodeJS 微服务，经千万级用户验证。比 JSON 更强大，类型安全，支持二进制传输。"
      keywords='TSRPC,TypeScript,WebSocket,OpenAPI,Swagger,TypeScript RPC,NodeJS,Node,NodeJS框架,gRPC,NestJS,Thrift,socketIO,protobuf,后端框架,后台框架,TypeScript序列化,TypeScript运行时,k8w'
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
