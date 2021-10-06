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
      description="TSRPC 是领先的 TypeScript RPC 开源框架，适用于浏览器 Web 应用、WebSocket 实时应用、NodeJS 微服务等场景。类型安全，二进制加密，比 JSON 更强大的数据结构，同时支持 HTTP 和 WebSocket。"
      keywords='TSRPC,TypeScript,WebSocket框架,TypeScript NodeJS,TypeScript RPC,NodeJS,Node,WebSocket,NodeJS框架,gRPC,NestJS,Thrift,socketIO,protobuf,后端框架,后台框架,TypeScript序列化,TypeScript运行时,k8w'
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
