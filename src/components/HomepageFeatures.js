import clsx from 'clsx';
import React from 'react';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'TypeScript',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        直接使用 TypeScript 的类型系统定义协议，
        无需任何注释、Decorator、第三方语言。
      </>
    ),
  },
  {
    title: '运行时类型检测',
    Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        运行时 TypeScript 类型检测，输入输出总是类型安全，放心编写业务代码。
      </>
    ),
  },
  {
    title: '二进制序列化',
    Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        核心黑科技，将 TypeScript 类型直接序列化成二进制，甚至支持复杂的嵌套类型！
      </>
    ),
  },
  {
    title: '多协议支持',
    Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        同时支持 HTTP 和 WebSocket<br />
        向后兼容传统 JSON API
      </>
    ),
  },
  {
    title: '多平台客户端',
    Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        浏览器 / 原生 / NodeJS / 微信小程序
      </>
    ),
  },
  {
    title: '高性能',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        单核 5000+ QPS<br />
        MacBook Air M1, 2020
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
