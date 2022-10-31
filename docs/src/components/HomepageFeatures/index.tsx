import React from 'react'
import clsx from 'clsx'
import styles from './styles.module.css'

interface FeatureItem {
  title: string
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Familiar',
    description: (
      <>
        Solib's API is familiar to Ethereum's very own <code>@wagmi/core</code> library and its
        friendly API.
      </>
    )
  },
  {
    title: 'Everything is handled',
    description: (
      <>
        No need to worry about formatting a transaction or preparing a signer, all that will be
        handled in the background.
      </>
    )
  },
  {
    title: 'All functionality baked in',
    description: (
      <>
        Signing messages all the way to communication with SNS, all ready for use, just a simple
        function call.
      </>
    )
  }
]

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
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
  )
}
