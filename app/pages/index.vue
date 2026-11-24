<template>
  <div>
    <HeroSection />
    <FeaturesSection />
    <NewsSection />
    <DownloadsSection />
    <MoonbaseArrivals />
    <CommunitySection />
  </div>
</template>

<script setup lang="ts">
usePageSeo({
  description: 'Lunar Linux is a source-based distribution: build your system exactly how you want it, with simple tools and a friendly community.'
})

const organization = useOrganization()
const pageUrl = usePageUrl()
useStructuredData({
  '@graph': [
    organization,
    { '@type': 'WebSite', '@id': `${pageUrl('/')}#website`, 'name': SITE_NAME, 'url': pageUrl('/'), 'publisher': { '@id': organization['@id'] } }
  ]
})
</script>
