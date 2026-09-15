import React from 'react';
import Layout from '@theme/Layout';
import { LabsHero, LearningTracks, MiscLabs, ThirdPartyLabs } from '@site/src/components/Labs';

export default function LabsPage() {
  return (
    <Layout
      title="Labs"
      description="Hands-on Infrahub labs on Instruqt: guided learning tracks, standalone OpsMill labs, and labs from partners and the community."
    >
      <main>
        <LabsHero />
        <LearningTracks />
        <MiscLabs />
        <ThirdPartyLabs />
      </main>
    </Layout>
  );
}
