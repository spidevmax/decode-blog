/**
 * Editorial content: short news items and long-form features.
 *
 * Both share the shape the article pages rely on — `id`, `title`, `date`,
 * `excerpt` and `body` (an array of paragraphs, same as ALBUMS). Each type
 * then adds its own metadata: news carries a `source`, features carry
 * `kicker`, `readingTime` and a `pullQuote`.
 *
 * News items have no pull quote on purpose: they are short wire reports, and
 * lifting a line out of four paragraphs reads as filler.
 *
 * Paragraphs support the same `*emphasis*` markup as review bodies.
 */

export const NEWS = [
	{
		id: "arctic-monkeys-studio",
		title: "Arctic Monkeys Return to the Studio",
		date: "2026-07-22",
		source: "Band Statement",
		excerpt:
			"The group confirmed work has begun on their next studio album, marking their first recording sessions in nearly four years.",
		body: [
			"Arctic Monkeys have confirmed they are back in the studio, beginning work on the follow-up to their last record and returning to sessions for the first time in nearly four years.",
			"The statement, posted to the band’s official channels, gave no release window and no title. It described the sessions as being at an early stage, with the group writing and recording in the same room rather than trading files remotely.",
			"The band spent much of the previous two years on the road, and members had spoken in interviews about wanting a long pause before committing to new material. That pause now appears to be over.",
			"No producer has been named, and the band have not said whether the sessions will continue into the autumn.",
		],
	},
	{
		id: "billie-eilish-charity",
		title: "Billie Eilish Announces Global Charity Concert",
		date: "2026-07-18",
		source: "Official Website",
		excerpt:
			"A one-night event featuring guest artists will raise funds for climate and environmental initiatives across five continents.",
		body: [
			"Billie Eilish has announced a one-night charity concert that will raise funds for climate and environmental initiatives across five continents.",
			"The event will be staged at a single venue and streamed globally, with guest artists joining across the evening. Organisers say the full lineup will be revealed closer to the date.",
			"Proceeds are earmarked for a coalition of regional environmental organisations rather than a single beneficiary, an approach the announcement described as deliberately distributed.",
			"Ticketing details, including a ballot for in-person attendance, are expected in the coming weeks.",
		],
	},
	{
		id: "phoenix-festival-lineup",
		title: "Phoenix Sound Festival Reveals Full Lineup",
		date: "2026-07-13",
		source: "Festival Organizers",
		excerpt:
			"More than 70 artists are scheduled to perform across three stages, with indie, electronic, and alternative acts leading the bill.",
		body: [
			"Phoenix Sound Festival has published its full lineup: more than seventy artists across three stages, with indie, electronic and alternative acts leading the bill.",
			"The programming leans more heavily on electronic acts than in previous editions, and the second stage has been expanded to run later into the night.",
			"Organisers also confirmed a smaller fourth space dedicated to local and unsigned artists, programmed in partnership with venues from the surrounding region.",
			"The festival runs across three days, with day tickets going on sale alongside full weekend passes.",
		],
	},
	{
		id: "vinyl-sales-record",
		title: "Independent Record Stores Report Record Vinyl Sales",
		date: "2026-07-05",
		source: "Retail Association",
		excerpt:
			"Collectors and younger listeners pushed vinyl sales to their strongest summer figures in over a decade.",
		body: [
			"Independent record stores have reported their strongest summer vinyl figures in over a decade, according to data published by the retail association.",
			"The report credits two distinct groups: established collectors buying reissues and back catalogue, and younger listeners buying new releases as physical objects alongside their streaming habits.",
			"Store owners quoted in the report noted that the growth is concentrated in new pressings rather than second-hand stock, which has stayed broadly flat.",
			"Pressing plant capacity remains the sector’s main constraint, with lead times still measured in months rather than weeks.",
		],
	},
	{
		id: "nova-album-release",
		title: "Nova Shares Details of Upcoming Album",
		date: "2026-06-27",
		source: "Artist Social Media",
		excerpt:
			"The singer-songwriter unveiled the tracklist, cover art, and release date for a twelve-song project arriving this fall.",
		body: [
			"Nova has revealed the tracklist, cover art and release date for her next album, a twelve-song project arriving this autumn.",
			"The announcement came directly through the artist’s social channels, with no accompanying single. Nova described the record as written mostly in one stretch, and sequenced in the order the songs were finished.",
			"The cover art, a single photograph with no text, continues the stripped-back visual direction of her previous releases.",
			"A short run of live dates is expected to follow the release, though none have been confirmed.",
		],
	},
	{
		id: "radiohead-archive-reissue",
		title: "Radiohead Open Their Tape Archive for a Reissue Series",
		date: "2026-06-19",
		source: "Label Announcement",
		excerpt:
			"The band’s label confirmed a multi-volume reissue series drawn from unreleased session tapes held since the late nineties.",
		body: [
			"Radiohead’s label has confirmed a multi-volume reissue series drawn from session tapes held in the band’s archive since the late nineties.",
			"The first volume collects material from a single set of sessions, presented in recording order rather than as a curated selection. The label said the sequencing was the band’s decision.",
			"No unreleased songs have been named, though the announcement referred to “alternate arrangements” of tracks already familiar from the finished records.",
			"Volumes will be released individually rather than as a boxed set, with the first arriving before the end of the year.",
		],
	},
	{
		id: "grammy-category-changes",
		title: "Recording Academy Adds Two Genre Categories",
		date: "2026-06-11",
		source: "Recording Academy",
		excerpt:
			"The awards body confirmed two new genre categories, the first structural change to the ballot in four years.",
		body: [
			"The Recording Academy has confirmed two new genre categories, the first structural change to its ballot in four years.",
			"Both additions split existing catch-all categories that had drawn criticism for grouping unrelated styles under a single heading, a complaint raised repeatedly by nominated artists.",
			"The Academy said the changes followed a review of submission volumes, noting that both affected categories had grown well beyond the point where a single award could represent them.",
			"The new categories take effect with the next eligibility period, and no existing awards were retired to make room.",
		],
	},
	{
		id: "streaming-royalty-threshold",
		title: "Major Platform Raises Minimum Stream Threshold for Payouts",
		date: "2026-05-30",
		source: "Industry Press Release",
		excerpt:
			"Tracks below an annual play count will no longer generate royalties, a change independent labels have called disproportionate.",
		body: [
			"A major streaming platform has raised the annual play threshold a track must clear before it generates royalties, redirecting the affected revenue into the pool shared by everything above the line.",
			"The company framed the change as a measure against fraudulent uploads and functionally dormant catalogue, arguing that the sums involved are too small to reach artists individually.",
			"Independent labels have pushed back, noting that the policy falls hardest on deep catalogue and niche genres where per-track counts are low but collectively meaningful.",
			"The threshold applies per track rather than per artist, meaning a catalogue can lose revenue on most of its titles while remaining well above the line overall.",
		],
	},
	{
		id: "the-marrows-split",
		title: "The Marrows Announce Indefinite Hiatus",
		date: "2026-05-21",
		source: "Band Statement",
		excerpt:
			"After eleven years and four albums, the quartet said they are stopping without a planned end date or farewell tour.",
		body: [
			"The Marrows have announced an indefinite hiatus, ending eleven years and four albums without a farewell tour or a stated return date.",
			"The statement was unusually plain, describing the decision as mutual and long-discussed rather than the result of any single disagreement. No member is quoted individually.",
			"The band cancelled a short run of summer festival appearances alongside the announcement, with organisers confirming replacements would be named separately.",
			"Two members have existing solo projects; the statement made no reference to either.",
		],
	},
	{
		id: "abbey-road-restoration",
		title: "Historic Studio Completes Two-Year Restoration",
		date: "2026-05-07",
		source: "Studio Press Office",
		excerpt:
			"The rebuild replaced the live room’s acoustic treatment while retaining its original desk and tape machines.",
		body: [
			"A two-year restoration of one of the country’s longest-running recording studios has finished, with the main live room reopening to bookings this month.",
			"The work replaced the room’s acoustic treatment and rebuilt its floor, both of which had degraded well past the point where routine maintenance could help.",
			"The studio’s original desk and tape machines were retained and serviced rather than replaced, a decision the press office attributed to demand from clients booking specifically for that signal path.",
			"Rates and booking policy are unchanged, including the reduced weekday allocation held for independent artists.",
		],
	},
	{
		id: "kiera-vaughn-debut",
		title: "Kiera Vaughn Announces Debut Album After Three EPs",
		date: "2026-04-24",
		source: "Artist Social Media",
		excerpt:
			"The songwriter confirmed a full-length record for the autumn, produced entirely in a single ten-day session.",
		body: [
			"Kiera Vaughn has confirmed her debut full-length album, arriving this autumn after three EPs released across four years.",
			"The record was made in a single ten-day session with a live band, a departure from the layered, self-produced approach of her earlier releases.",
			"Vaughn said in the announcement that the compressed timeline was deliberate, describing the EPs as having taken longer than the songs needed.",
			"A lead single arrives next month, with the tracklist held back until closer to release.",
		],
	},
	{
		id: "ticketing-fee-ruling",
		title: "Regulator Orders All-In Pricing for Concert Tickets",
		date: "2026-04-16",
		source: "Consumer Regulator",
		excerpt:
			"Platforms must display the full cost including fees from the first screen, with a six-month compliance window.",
		body: [
			"The consumer regulator has ordered ticketing platforms to display the full price of a ticket, fees included, from the first screen a buyer sees.",
			"The ruling ends the practice of adding service and processing charges at checkout, which the regulator found had materially misled buyers about the cost of attending shows.",
			"Platforms have six months to comply. The order sets no cap on fees themselves, only on when they must be disclosed.",
			"Several independent venues welcomed the decision while noting that their own fees, unlike those of the resale market, largely cover operating costs.",
		],
	},
	{
		id: "public-library-vinyl",
		title: "City Libraries Begin Lending Vinyl Records",
		date: "2026-04-02",
		source: "Municipal Press Office",
		excerpt:
			"A pilot across nine branches will lend records and turntables, funded by a cultural participation grant.",
		body: [
			"Nine city library branches have begun lending vinyl records, alongside a smaller stock of turntables available on the same terms as other equipment loans.",
			"The pilot is funded by a cultural participation grant and stocked partly through donations, with the remainder bought new from local independent retailers.",
			"Branch staff said the initial catalogue leans towards back catalogue and reissues, with requests driving what is acquired next.",
			"The programme runs for a year, after which the council will decide whether to extend it across the full network.",
		],
	},
	{
		id: "festival-cancellation-weather",
		title: "Coastal Festival Cancels Final Day After Storm Warning",
		date: "2026-03-19",
		source: "Festival Organizers",
		excerpt:
			"Organisers cancelled Sunday’s programme on safety grounds, with refunds issued automatically for day tickets.",
		body: [
			"Organisers of a coastal festival cancelled the event’s final day following a storm warning, citing wind speeds forecast to exceed the safe limit for the main stage structure.",
			"The decision was taken the previous evening, allowing the site to be cleared and staged equipment secured before conditions worsened.",
			"Day tickets for the cancelled programme are being refunded automatically. Weekend passes will be refunded pro rata, a policy the organisers confirmed within hours of the announcement.",
			"Two headline acts have since said they will attempt to reschedule as standalone shows in the region.",
		],
	},
	{
		id: "label-catalogue-sale",
		title: "Independent Label Sells Catalogue to Investment Fund",
		date: "2026-03-05",
		source: "Trade Press",
		excerpt:
			"The thirty-year-old label sold its recorded catalogue while retaining its name and A&R operation.",
		body: [
			"A long-running independent label has sold its recorded music catalogue to an investment fund, in a deal covering three decades of releases.",
			"The label retains its name, staff and A&R operation, and will continue signing and releasing new artists. Only the existing recordings changed hands.",
			"Terms were not disclosed. The label’s founder described the sale as funding continued operation rather than an exit, a framing the trade press treated with some scepticism.",
			"Several artists on the affected catalogue said they learned of the sale from the announcement.",
		],
	},
	{
		id: "music-education-funding",
		title: "Schools Music Programme Restored After Funding Reversal",
		date: "2026-02-20",
		source: "Department Statement",
		excerpt:
			"Instrument tuition returns to primary schools next term following a reversal of last year’s cuts.",
		body: [
			"Instrument tuition will return to primary schools next term after the department reversed cuts made to the programme last year.",
			"The restored funding covers tuition and instrument maintenance, though at a level below the pre-cut allocation once inflation is accounted for.",
			"Music teaching organisations welcomed the reversal while noting that the intervening year cost the sector staff who have not returned to it.",
			"The department gave no commitment beyond the coming academic year.",
		],
	},
];

export const FEATURES = [
	{
		id: "streaming-algorithm-shift",
		title: "How Streaming Algorithms Are Changing Music Discovery",
		kicker: "Analysis",
		date: "2026-07-20",
		readingTime: "10 min",
		excerpt:
			"Recommendation systems increasingly shape what listeners hear, raising new questions about visibility, diversity, and artistic independence.",
		pullQuote:
			"The algorithm does not decide what is good. It decides what is easy to reach.",
		body: [
			"Recommendation systems now sit between most listeners and most music. What surfaces in a personalised playlist is not a neutral reflection of what exists; it is the output of a model optimising for engagement, and that distinction has consequences.",
			"The clearest effect is on song structure. Tracks increasingly front-load their hooks, because a skip in the first thirty seconds costs more than a weak final minute. Artists describe writing with that threshold consciously in mind.",
			"The second effect is on the middle of the market. Recommendation engines are good at serving the very popular, and surprisingly good at serving the very niche, where listening signals are dense and distinctive. Artists in between — too big for the long tail, too small for the playlists — report the sharpest drop in discovery.",
			"None of this is straightforwardly bad. The same systems have given genuinely obscure records audiences they could never have reached through radio or retail. *Discovery* has widened for listeners even as it has narrowed for many artists.",
			"What is missing is legibility. Artists cannot see why a track was or was not picked up, and platforms have little incentive to explain. Until that changes, the debate stays stuck on anecdote.",
		],
	},
	{
		id: "vinyl-comeback",
		title: "Why Vinyl Keeps Growing in the Digital Era",
		kicker: "Feature",
		date: "2026-07-09",
		readingTime: "8 min",
		excerpt:
			"Collectors, audiophiles, and younger audiences continue to fuel the resurgence of physical records despite the dominance of streaming.",
		pullQuote:
			"People are not buying vinyl instead of streaming. They are buying it because of streaming.",
		body: [
			"The vinyl revival has now outlasted every prediction of its end. What began as a collectors’ niche is a stable, growing part of how records are sold — and the reasons have less to do with audio quality than the format’s defenders usually claim.",
			"Ask buyers under thirty why they bought a record and the answers rarely mention frequency response. They mention wanting to own something, wanting to support an artist directly, and wanting an object that does not disappear when a licensing deal lapses.",
			"That last point matters more than it used to. A decade of catalogue moving on and off streaming services has taught listeners that access is not the same as ownership.",
			"The industry has adapted accordingly. Variant pressings, coloured editions and exclusive sleeves are now standard, and for many releases the physical run is planned as a collectable first and a listening format second.",
			"The constraint is manufacturing. Pressing capacity has grown, but not fast enough, and small labels still queue behind major-label reissues for the same machines.",
		],
	},
	{
		id: "bedroom-producers",
		title: "The Rise of the Bedroom Producer",
		kicker: "Report",
		date: "2026-06-25",
		readingTime: "13 min",
		excerpt:
			"Affordable software and online collaboration have made it possible for independent musicians to build global audiences from home studios.",
		pullQuote:
			"The studio stopped being a place you book and became a thing you already own.",
		body: [
			"The economics of recording have inverted. Equipment that once required a booked studio and an engineer now runs on a laptop, and a generation of musicians has never worked any other way.",
			"The shift is not only about cost. Working alone, without an hourly rate running, changes what gets attempted. Producers describe leaving projects open for months and returning to them, a pattern that studio time actively discourages.",
			"Collaboration has followed the same path. Sessions are assembled asynchronously across time zones, with contributors who may never meet, and the resulting credit lists look nothing like those of a decade ago.",
			"The trade-off is isolation. Several producers interviewed for this piece described the absence of an engineer as the hardest part — not for technical reasons, but for the missing second opinion.",
			"What has not changed is the difficulty of being heard. Removing the barrier to making a record removed it for everyone at once, and attention did not scale to match.",
		],
	},
	{
		id: "live-music-revival",
		title: "Inside the New Wave of Independent Live Venues",
		kicker: "Interview",
		date: "2026-06-08",
		readingTime: "11 min",
		excerpt:
			"Venue owners, promoters, and artists discuss how smaller stages are becoming the backbone of emerging music scenes.",
		pullQuote:
			"Every band you will see in an arena in five years is playing to forty people somewhere tonight.",
		body: [
			"Small venues occupy an awkward position: essential to how artists develop, and consistently the least financially secure part of the live sector. The people running them are unusually clear-eyed about both halves of that sentence.",
			"The operators interviewed for this piece described margins that depend almost entirely on bar takings rather than ticket sales, leaving them exposed to any change in how audiences drink or how late they stay.",
			"Several have restructured as community-owned or non-profit entities, trading the possibility of profit for the stability of grant eligibility and protection from rising commercial rents.",
			"Artists describe the same venues as irreplaceable. A room of fifty people is where material gets tested, and no amount of streaming traction substitutes for having played it.",
			"The consensus among those interviewed was that the sector does not need rescuing so much as recognising — as *infrastructure* rather than as small business.",
		],
	},
	{
		id: "ai-in-the-studio",
		title: "What Producers Actually Do With AI Tools",
		kicker: "Analysis",
		date: "2026-05-28",
		readingTime: "12 min",
		excerpt:
			"Behind the headlines about generated songs, the real adoption is quieter: separation, cleanup, and the unglamorous middle of a session.",
		pullQuote:
			"Nobody is asking a model to write the chorus. They are asking it to remove a hum from the take that already works.",
		body: [
			"The public argument about AI in music is about authorship. The studio argument is about labour, and the two have almost nothing to do with each other.",
			"Ask working producers what they actually use and the answers are consistent: stem separation, noise removal, pitch and timing correction on individual takes. Tasks that were possible before, but slow enough to discourage attempting them.",
			"That distinction matters because it changes which decisions get revisited. A guitar part that was previously locked once the session ended is now editable months later, and producers describe both the freedom and the difficulty of never having to commit.",
			"Generative tools are present but marginal. Where they appear, it is usually as placeholder material — a temporary string arrangement to audition an idea before booking players — rather than anything that survives to the master.",
			"The genuine anxiety is further down the chain. The session musicians and engineers whose work these tools approximate are not the people writing the think pieces, and they are the ones describing lost bookings.",
		],
	},
	{
		id: "album-length-shrinking",
		title: "The Album Is Getting Shorter, and Not Only Because of Streaming",
		kicker: "Feature",
		date: "2026-05-14",
		readingTime: "9 min",
		excerpt:
			"Runtimes have fallen steadily for a decade. The usual explanation is incomplete, and the more interesting reasons are editorial.",
		pullQuote:
			"A thirty-four minute record is not a concession. For most of recorded history it was simply the length of a record.",
		body: [
			"The average album is shorter than it was ten years ago, and the standard explanation — that streaming rewards skip-resistant brevity — is true without being sufficient.",
			"Payout mechanics push in the opposite direction as often as not: more tracks mean more chances to be played, and the era of twenty-track releases was itself a streaming-era phenomenon. The shortening is happening despite that incentive, not because of it.",
			"Artists interviewed offered a simpler account. Records made in long, self-directed sessions accumulate material, and the editing pass that follows is now more aggressive because releasing the offcuts separately costs nothing.",
			"There is also a return to a historical norm. The seventy-minute album was an artefact of CD capacity, not an artistic form that anyone missed once it went away.",
			"What has changed is the surrounding structure. A short album now arrives inside a longer cycle of singles, deluxe editions and loose tracks, and *the record* is only the most legible part of a much larger release.",
		],
	},
	{
		id: "tour-economics",
		title: "Why Mid-Level Touring Stopped Adding Up",
		kicker: "Report",
		date: "2026-04-30",
		readingTime: "14 min",
		excerpt:
			"Bands playing to a thousand people a night are cancelling runs that would have been routine five years ago. The costs explain most of it.",
		pullQuote:
			"The shows sell out. That was never the part that was broken.",
		body: [
			"A run of cancelled tours by well-established mid-level acts has prompted the same question each time: if the tickets sold, what went wrong?",
			"The answer is almost entirely on the cost side. Freight, crew, insurance and vehicle hire have risen faster than ticket prices, and mid-level acts have the least room to pass that on — their audiences are price-sensitive in a way that arena audiences demonstrably are not.",
			"Tour managers describe budgets that now break even only at full capacity, which turns any weak night into a loss the rest of the run has to absorb.",
			"The structural response has been to tour less often and further, favouring longer gaps and larger rooms. That works for the acts who can fill them and quietly removes a rung from the ladder for those who cannot.",
			"Several managers argued that guarantees, not ticket prices, are the real pressure point, and that the current model pushes risk onto exactly the artists least able to carry it.",
		],
	},
	{
		id: "loudness-war-ceasefire",
		title: "The Loudness War Ended and Almost Nobody Announced It",
		kicker: "Analysis",
		date: "2026-04-11",
		readingTime: "10 min",
		excerpt:
			"Normalisation on streaming platforms removed the incentive to master everything as loud as possible. Mastering engineers noticed first.",
		pullQuote:
			"Loudness stopped being an advantage the moment the platform started turning everything down to the same level.",
		body: [
			"For two decades, records got louder because loud records sounded better in comparison — on the radio, in a shop, in a playlist. Then platforms began normalising playback, and the comparison disappeared.",
			"Mastering engineers describe the change as immediate in effect and slow in adoption. The technical incentive vanished years before clients stopped asking for competitive levels.",
			"What replaced it is harder to name. With a loudness ceiling effectively imposed from outside, the remaining variable is dynamic range, and engineers report being asked to make records *feel* louder without measuring louder.",
			"The back catalogue tells the story most clearly. Reissues mastered in the mid-2000s now play back quieter and flatter than the originals they replaced, having spent their headroom on an advantage that no longer exists.",
			"There is no obvious mechanism for fixing that, and remastering a remaster is a commercially unappealing proposition.",
		],
	},
	{
		id: "session-musicians-credits",
		title: "The Fight Over Who Gets Named on a Record",
		kicker: "Report",
		date: "2026-03-27",
		readingTime: "12 min",
		excerpt:
			"Credits data was standardised for physical releases and never fully rebuilt for streaming. The people it omits are the ones it always omitted.",
		pullQuote:
			"The information exists. It is written on a form in a studio somewhere. It simply never reaches the page anyone reads.",
		body: [
			"Streaming platforms display an artist, sometimes a producer and occasionally a writer. The players, engineers and arrangers who made the record are, for most releases, absent entirely.",
			"This is not a technical limitation. The metadata standards accommodate full credits; the problem is that nothing in the chain between the session and the platform requires anyone to supply them.",
			"Session musicians interviewed described the practical consequences: lost work from being uncreditable, and difficulty proving a track record that exists only in their own records.",
			"Some labels have begun submitting full credits voluntarily, and a handful of platforms now display them. Both remain the exception, and coverage on back catalogue is close to nonexistent.",
			"The people arguing for change are clear that it is a question of enforcement rather than invention. Nobody needs to build anything new for a bass player to be named.",
		],
	},
	{
		id: "genre-tagging-problem",
		title: "Nobody Agrees What Genre Anything Is Anymore",
		kicker: "Feature",
		date: "2026-03-12",
		readingTime: "9 min",
		excerpt:
			"Platform tags, press descriptions and how artists describe themselves have drifted apart, and the gaps are doing real work.",
		pullQuote:
			"A genre used to tell you which shelf to look on. Now it tells you which playlist a machine thought you belonged to.",
		body: [
			"Genre was always approximate, but it was at least shared. A record filed under one heading in a shop was filed the same way in a review and on the sleeve.",
			"That agreement has broken down. Platform tags are derived from listening behaviour, press descriptions from lineage and sound, and artists increasingly refuse the question altogether.",
			"The divergence has consequences beyond taxonomy. Festival bookings, playlist eligibility and awards categories all still run on genre, and being classified differently by different systems is not a neutral condition.",
			"Artists working across recognised boundaries report the worst of it: too far from any single category to be programmed confidently, and too legible to be treated as genuinely uncategorisable.",
			"The old system was reductive and the new one is incoherent. It is not obvious that the trade was favourable.",
		],
	},
	{
		id: "record-shop-survival",
		title: "How Record Shops Learned to Stop Selling Records",
		kicker: "Feature",
		date: "2026-02-26",
		readingTime: "11 min",
		excerpt:
			"The shops that survived the last fifteen years mostly did so by becoming something other than shops.",
		pullQuote:
			"The counter still sells records. The business is the room behind it.",
		body: [
			"The independent record shops still trading are, with few exceptions, no longer businesses that primarily sell records over a counter.",
			"They host in-store performances, run cafés and bars, sell coffee at better margins than vinyl, and increasingly operate small labels of their own. The stock is the reason people come; it is rarely the reason the lights stay on.",
			"Owners describe the shift without much romance. Retail margins on new vinyl are thin and set by distributors, and the volume required to live on them is out of reach for a single site.",
			"What the diversification preserves is the part that was worth preserving: staff who know the stock, and a physical room where people encounter music they were not looking for.",
			"Several owners were sceptical of the *community hub* framing that has grown up around this, pointing out that it is what shops always were, and that calling it a strategy is mostly a way of applying for funding.",
		],
	},
	{
		id: "sampling-clearance",
		title: "Sample Clearance Is Slower Than It Has Ever Been",
		kicker: "Report",
		date: "2026-02-12",
		readingTime: "13 min",
		excerpt:
			"Catalogue sales have multiplied the number of parties who must sign off, and releases are being delayed by months as a result.",
		pullQuote:
			"There is no dispute. There is simply nobody left who can say yes on their own.",
		body: [
			"Clearing a sample now routinely takes longer than making the record it appears on, and the reason is structural rather than adversarial.",
			"A decade of catalogue acquisitions has fragmented ownership. Rights that once sat with a single publisher may now be split across several funds, each with its own approval process and none with an incentive to move quickly.",
			"Producers describe building tracks around samples they expect to lose, and keeping replacement parts recorded in advance. The practice is now common enough to be a standard part of budgeting a release.",
			"The cost falls unevenly. Major-label projects have staff whose job is chasing these approvals; independent artists have themselves, and frequently give up.",
			"Several interviewees argued that the practical effect is a return to pre-clearance conditions — not because sampling is unlicensed, but because for many artists it has become effectively unavailable.",
		],
	},
	{
		id: "listening-rooms",
		title: "The Return of Sitting Still and Listening",
		kicker: "Feature",
		date: "2026-01-29",
		readingTime: "8 min",
		excerpt:
			"Dedicated listening bars have spread well beyond their origins, and the appeal appears to be the constraint rather than the audio.",
		pullQuote:
			"You are not allowed to talk, you cannot choose the record, and people are queueing to get in.",
		body: [
			"Listening bars — rooms built around a single sound system, playing records in sequence, with conversation discouraged — have spread from a handful of cities to most of them.",
			"The obvious explanation is audio quality, and it is not quite right. Regulars interviewed talked less about the system than about the rules: no choosing, no skipping, no second screen.",
			"That framing suggests the appeal is scarcity of a specific kind. Undivided attention has become difficult to arrange privately, and these rooms sell it as a service.",
			"Operators are wary of the trend’s trajectory. Several described new venues copying the aesthetic — the furniture, the horn speakers — while relaxing exactly the constraints that make the format work.",
			"Whether it survives depends on that discipline. A listening bar where people talk is a bar with an expensive stereo.",
		],
	},
	{
		id: "posthumous-releases",
		title: "Who Decides What an Artist Releases After They Die",
		kicker: "Analysis",
		date: "2026-01-15",
		readingTime: "12 min",
		excerpt:
			"Estates, labels and surviving collaborators frequently disagree, and the recordings themselves rarely settle the question.",
		pullQuote:
			"An unfinished take is evidence of a decision in progress. Releasing it makes that decision on the artist’s behalf.",
		body: [
			"Posthumous releases sit on an uncomfortable premise: that material an artist did not finish, or actively withheld, can be completed by other people and issued in their name.",
			"The parties involved rarely agree. Estates have legal authority, labels have the recordings, and surviving collaborators have the strongest claim to knowing what was intended — a claim with no standing whatsoever.",
			"The technical situation has made this worse. Separation tools now allow a rough demo to be rebuilt into something that sounds finished, removing the practical constraint that once kept unfinished work unreleased.",
			"Defenders point to the archival case, and it is real: some of the most valued records in several catalogues were assembled after the fact and clearly served the work.",
			"The distinction those cases share is transparency about what was done. A release presented as *what the artist was working on* asks nothing of the listener that a release presented as a finished album does not.",
		],
	},
];
