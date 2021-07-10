import clsx from 'clsx';
import React from 'react';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: '原汁原味 TypeScript',
    Svg: require('../../static/img/feature_1.svg').default,
    description: (
      <>
        直接使用 TypeScript 的类型定义协议<br />
        无需任何注释、Decorator、第三方语言
      </>
    ),
  },
  {
    title: '运行时类型检测',
    Svg: require('../../static/img/feature_2.svg').default,
    description: (
      <>
        运行时 TypeScript 类型检测<br />
        自动检测输入输出，总是类型安全
      </>
    ),
  },
  {
    title: '二进制序列化',
    Svg: require('../../static/img/feature_3.svg').default,
    description: (
      <>
        包体更小、更易加密、天然防破解<br />
        支持传输 ArrayBuffer / Date 等更多类型
      </>
    ),
  },
  {
    title: '多协议',
    Svg: require('../../static/img/feature_4.svg').default,
    description: (
      <>
        同时支持 HTTP 和 WebSocket<br />
        兼容 HTTP / JSON 调用
      </>
    ),
  },
  {
    title: '多平台',
    Svg: require('../../static/img/feature_5.svg').default,
    description: (
      <>
        浏览器 / 原生 / NodeJS / 微信小程序<br />
        支持 Serverless 云函数部署
      </>
    ),
  },
  {
    title: '高性能',
    Svg: require('../../static/img/feature_6.svg').default,
    description: (
      <>
        单核 5000+ QPS (Macbook Air 2020)<br />
        多个千万级 DAU 项目验证
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
