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
  description: 'Lunar Linux combines the flexibility of source-based distributions with user-friendly tools and interfaces. Build your system exactly how you want it, with the support you need.'
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
