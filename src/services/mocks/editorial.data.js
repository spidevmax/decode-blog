/**
 * Editorial content: short news items and long-form features.
 *
 * Both share the shape the article pages rely on — `id`, `title`, `date`,
 * `excerpt` and `body` (an array of paragraphs, same as ALBUMS). Each type
 * then adds its own metadata: news carries a `source`, features carry
 * `kicker`, `author`, `readingTime` and a `pullQuote`.
 *
 * News items have no pull quote on purpose: they are short wire reports, and
 * lifting a line out of four paragraphs reads as filler.
 *
 * Paragraphs support the same `*emphasis*` markup as review bodies.
 */

export const NEWS = [
  {
    id: 'arctic-monkeys-studio',
    title: 'Arctic Monkeys Return to the Studio',
    date: '2026-07-22',
    source: 'Band Statement',
    excerpt:
      'The group confirmed work has begun on their next studio album, marking their first recording sessions in nearly four years.',
    body: [
      'Arctic Monkeys have confirmed they are back in the studio, beginning work on the follow-up to their last record and returning to sessions for the first time in nearly four years.',
      'The statement, posted to the band’s official channels, gave no release window and no title. It described the sessions as being at an early stage, with the group writing and recording in the same room rather than trading files remotely.',
      'The band spent much of the previous two years on the road, and members had spoken in interviews about wanting a long pause before committing to new material. That pause now appears to be over.',
      'No producer has been named, and the band have not said whether the sessions will continue into the autumn.',
    ],
  },
  {
    id: 'billie-eilish-charity',
    title: 'Billie Eilish Announces Global Charity Concert',
    date: '2026-07-18',
    source: 'Official Website',
    excerpt:
      'A one-night event featuring guest artists will raise funds for climate and environmental initiatives across five continents.',
    body: [
      'Billie Eilish has announced a one-night charity concert that will raise funds for climate and environmental initiatives across five continents.',
      'The event will be staged at a single venue and streamed globally, with guest artists joining across the evening. Organisers say the full lineup will be revealed closer to the date.',
      'Proceeds are earmarked for a coalition of regional environmental organisations rather than a single beneficiary, an approach the announcement described as deliberately distributed.',
      'Ticketing details, including a ballot for in-person attendance, are expected in the coming weeks.',
    ],
  },
  {
    id: 'phoenix-festival-lineup',
    title: 'Phoenix Sound Festival Reveals Full Lineup',
    date: '2026-07-13',
    source: 'Festival Organizers',
    excerpt:
      'More than 70 artists are scheduled to perform across three stages, with indie, electronic, and alternative acts leading the bill.',
    body: [
      'Phoenix Sound Festival has published its full lineup: more than seventy artists across three stages, with indie, electronic and alternative acts leading the bill.',
      'The programming leans more heavily on electronic acts than in previous editions, and the second stage has been expanded to run later into the night.',
      'Organisers also confirmed a smaller fourth space dedicated to local and unsigned artists, programmed in partnership with venues from the surrounding region.',
      'The festival runs across three days, with day tickets going on sale alongside full weekend passes.',
    ],
  },
  {
    id: 'vinyl-sales-record',
    title: 'Independent Record Stores Report Record Vinyl Sales',
    date: '2026-07-05',
    source: 'Retail Association',
    excerpt:
      'Collectors and younger listeners pushed vinyl sales to their strongest summer figures in over a decade.',
    body: [
      'Independent record stores have reported their strongest summer vinyl figures in over a decade, according to data published by the retail association.',
      'The report credits two distinct groups: established collectors buying reissues and back catalogue, and younger listeners buying new releases as physical objects alongside their streaming habits.',
      'Store owners quoted in the report noted that the growth is concentrated in new pressings rather than second-hand stock, which has stayed broadly flat.',
      'Pressing plant capacity remains the sector’s main constraint, with lead times still measured in months rather than weeks.',
    ],
  },
  {
    id: 'nova-album-release',
    title: 'Nova Shares Details of Upcoming Album',
    date: '2026-06-27',
    source: 'Artist Social Media',
    excerpt:
      'The singer-songwriter unveiled the tracklist, cover art, and release date for a twelve-song project arriving this fall.',
    body: [
      'Nova has revealed the tracklist, cover art and release date for her next album, a twelve-song project arriving this autumn.',
      'The announcement came directly through the artist’s social channels, with no accompanying single. Nova described the record as written mostly in one stretch, and sequenced in the order the songs were finished.',
      'The cover art, a single photograph with no text, continues the stripped-back visual direction of her previous releases.',
      'A short run of live dates is expected to follow the release, though none have been confirmed.',
    ],
  },
];

export const FEATURES = [
  {
    id: 'streaming-algorithm-shift',
    title: 'How Streaming Algorithms Are Changing Music Discovery',
    kicker: 'Analysis',
    author: 'Marina Alcántara',
    date: '2026-07-20',
    readingTime: '10 min',
    excerpt:
      'Recommendation systems increasingly shape what listeners hear, raising new questions about visibility, diversity, and artistic independence.',
    pullQuote:
      'The algorithm does not decide what is good. It decides what is easy to reach.',
    body: [
      'Recommendation systems now sit between most listeners and most music. What surfaces in a personalised playlist is not a neutral reflection of what exists; it is the output of a model optimising for engagement, and that distinction has consequences.',
      'The clearest effect is on song structure. Tracks increasingly front-load their hooks, because a skip in the first thirty seconds costs more than a weak final minute. Artists describe writing with that threshold consciously in mind.',
      'The second effect is on the middle of the market. Recommendation engines are good at serving the very popular, and surprisingly good at serving the very niche, where listening signals are dense and distinctive. Artists in between — too big for the long tail, too small for the playlists — report the sharpest drop in discovery.',
      'None of this is straightforwardly bad. The same systems have given genuinely obscure records audiences they could never have reached through radio or retail. *Discovery* has widened for listeners even as it has narrowed for many artists.',
      'What is missing is legibility. Artists cannot see why a track was or was not picked up, and platforms have little incentive to explain. Until that changes, the debate stays stuck on anecdote.',
    ],
  },
  {
    id: 'vinyl-comeback',
    title: 'Why Vinyl Keeps Growing in the Digital Era',
    kicker: 'Feature',
    author: 'Diego Ferrán',
    date: '2026-07-09',
    readingTime: '8 min',
    excerpt:
      'Collectors, audiophiles, and younger audiences continue to fuel the resurgence of physical records despite the dominance of streaming.',
    pullQuote:
      'People are not buying vinyl instead of streaming. They are buying it because of streaming.',
    body: [
      'The vinyl revival has now outlasted every prediction of its end. What began as a collectors’ niche is a stable, growing part of how records are sold — and the reasons have less to do with audio quality than the format’s defenders usually claim.',
      'Ask buyers under thirty why they bought a record and the answers rarely mention frequency response. They mention wanting to own something, wanting to support an artist directly, and wanting an object that does not disappear when a licensing deal lapses.',
      'That last point matters more than it used to. A decade of catalogue moving on and off streaming services has taught listeners that access is not the same as ownership.',
      'The industry has adapted accordingly. Variant pressings, coloured editions and exclusive sleeves are now standard, and for many releases the physical run is planned as a collectable first and a listening format second.',
      'The constraint is manufacturing. Pressing capacity has grown, but not fast enough, and small labels still queue behind major-label reissues for the same machines.',
    ],
  },
  {
    id: 'bedroom-producers',
    title: 'The Rise of the Bedroom Producer',
    kicker: 'Report',
    author: 'Aitana Ruiz',
    date: '2026-06-25',
    readingTime: '13 min',
    excerpt:
      'Affordable software and online collaboration have made it possible for independent musicians to build global audiences from home studios.',
    pullQuote:
      'The studio stopped being a place you book and became a thing you already own.',
    body: [
      'The economics of recording have inverted. Equipment that once required a booked studio and an engineer now runs on a laptop, and a generation of musicians has never worked any other way.',
      'The shift is not only about cost. Working alone, without an hourly rate running, changes what gets attempted. Producers describe leaving projects open for months and returning to them, a pattern that studio time actively discourages.',
      'Collaboration has followed the same path. Sessions are assembled asynchronously across time zones, with contributors who may never meet, and the resulting credit lists look nothing like those of a decade ago.',
      'The trade-off is isolation. Several producers interviewed for this piece described the absence of an engineer as the hardest part — not for technical reasons, but for the missing second opinion.',
      'What has not changed is the difficulty of being heard. Removing the barrier to making a record removed it for everyone at once, and attention did not scale to match.',
    ],
  },
  {
    id: 'live-music-revival',
    title: 'Inside the New Wave of Independent Live Venues',
    kicker: 'Interview',
    author: 'Iván Costa',
    date: '2026-06-08',
    readingTime: '11 min',
    excerpt:
      'Venue owners, promoters, and artists discuss how smaller stages are becoming the backbone of emerging music scenes.',
    pullQuote:
      'Every band you will see in an arena in five years is playing to forty people somewhere tonight.',
    body: [
      'Small venues occupy an awkward position: essential to how artists develop, and consistently the least financially secure part of the live sector. The people running them are unusually clear-eyed about both halves of that sentence.',
      'The operators interviewed for this piece described margins that depend almost entirely on bar takings rather than ticket sales, leaving them exposed to any change in how audiences drink or how late they stay.',
      'Several have restructured as community-owned or non-profit entities, trading the possibility of profit for the stability of grant eligibility and protection from rising commercial rents.',
      'Artists describe the same venues as irreplaceable. A room of fifty people is where material gets tested, and no amount of streaming traction substitutes for having played it.',
      'The consensus among those interviewed was that the sector does not need rescuing so much as recognising — as *infrastructure* rather than as small business.',
    ],
  },
];
