import clsx from 'clsx';
import React from 'react';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: '原汁原味 TypeScript',
    Svg: require('../../static/img/ts.svg').default,
    description: (
      <>
        直接使用 TypeScript 的类型定义协议<br />
        无需装饰器、注解、第三方语言
      </>
    ),
  },
  {
    title: '类型安全',
    Svg: require('../../static/img/type-safe.svg').default,
    description: (
      <>
        编译时刻 + 运行时刻 双重检测<br />
        自动参数校验，总是类型安全
      </>
    ),
  },
  {
    title: '比 JSON 更强大',
    Svg: require('../../static/img/json-plus.svg').default,
    description: (
      <>
        支持在 JSON 中传输更多数据类型<br />
        例如 ArrayBuffer、Date、ObjectId
      </>
    ),
  },
  {
    title: '支持二进制传输',
    Svg: require('../../static/img/tsbuffer.svg').default,
    description: (
      <>
        可将 TypeScript 类型直接编码为二进制<br />
        包体更小、更易加密、天然防破解
      </>
    ),
  },
  {
    title: '支持 Serverless',
    Svg: require('../../static/img/serverless.svg').default,
    description: (
      <>
        同时支持 Serverless 云函数和容器化部署<br />
        兼容阿里云、腾讯云、AWS 标准
      </>
    ),
  },
  {
    title: '一键生成接口文档',
    Svg: require('../../static/img/api-doc.svg').default,
    description: (
      <>
        Swagger / OpenAPI 格式<br />
        及 Markdown 格式
      </>
    ),
  },
  {
    title: '多协议',
    Svg: require('../../static/img/multi-protocols.svg').default,
    description: (
      <>
        同时支持 HTTP 和 WebSocket<br />
        传输协议无关的架构，轻松扩展至任意信道
      </>
    ),
  },
  {
    title: '跨平台',
    Svg: require('../../static/img/multi-platforms.svg').default,
    description: (
      <>
        浏览器 / 小程序 / App / NodeJS 多平台支持<br />
        兼容 HTTP JSON API 调用
      </>
    ),
  },
  {
    title: '高性能',
    Svg: require('../../static/img/high-performance.svg').default,
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
