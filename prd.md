# M E L O S


> *Music Listening Experience turned Art*

*Product Requirements Document — v3.0*

  ------------------ ----------------------------------------------------
| | |
|---|---|
| **Status** | Draft — For Review |

  **Product Name**   Melos

  **Version**        2.0

  **Author**         To be assigned

  **Date**           March 2026

  **Domain**         melos.app

  **Platform**       Web (Desktop + Mobile responsive)

  **Integrations**   Spotify API, YouTube Music API, WebSockets
  ------------------ ----------------------------------------------------


---

## 1. Executive Summary
Melos is a browser-based, real-time multiplayer music experience that transforms the way people listen to, discover, and share music together. Rooted in the philosophy of "Music as Art," Melos turns every listening session into a visual, tactile, and deeply social event.

Users search for songs via integrated Spotify and YouTube Music, watch their selected track materialise as a beautifully rendered CD disc, see that disc physically slot into an animated CD player, and then hear the music play — all within a richly illustrated, warm-toned aesthetic that feels closer to a digital art installation than a conventional music app.

Rooms allow multiple listeners to share the same queue, react in real time, and co-create playlists — turning passive listening into a communal ritual.


---

## 2. Problem Statement
### 2.1. The Gap in the Market
Streaming platforms have optimised ruthlessly for utility: fast search, personalised algorithms, offline sync. What they have largely abandoned is delight. Music is an emotional and social medium, yet the dominant interfaces are lists, grids, and sliders.

### 2.2. User Pain Points
-   Listening together remotely is clunky — existing solutions require screen-sharing hacks or third-party synchronisation tools.

-   Music apps feel transactional, not expressive. There is no sense of ceremony around choosing or playing a song.

-   Shared playlists exist, but real-time co-presence — seeing someone else add a track, reacting to a song — is absent.

-   The visual identity of digital music has regressed: we lost album art as a centrepiece when we moved from vinyl and CD to streaming thumbnails.

### 2.3. Opportunity
There is clear appetite for nostalgia-forward, aesthetically rich digital experiences (see: the vinyl record market resurgence, Polaroid cameras, cassette tape merchandise). Melos taps this sentiment and pairs it with the convenience of modern streaming and the social energy of real-time multiplayer.


---

## 3. Product Vision & Goals
***"Every song deserves a ceremony."***

### 3.1. Vision Statement
Melos is the world's most beautiful way to listen to music with other people. It is not just a player — it is a living art piece that responds to sound, shared presence, and human emotion.

### 3.2. Success Metrics
  ----------------------------------- -----------------------------------
  **Metric**                          **Target (6 months post-launch)**

  Daily Active Rooms                  5,000+

  Avg. Session Duration               \> 40 minutes

  Viral Room Shares                   30% of sessions share link

  D7 Retention                        \> 35%

  NPS Score                           \> 60
  ----------------------------------- -----------------------------------


---

## 4. Target Audience & Personas
**Persona 1 — The Nostalgic Aesthetic**

| **Maya, 24 — Design Student**                                                                                                                                                                                                                                                                                    |
|                                                                                                                                                                                                                                                                                                                    |
| Maya grew up listening to her parents' CD collection. She loves lo-fi playlists, collects vintage cassettes, and posts aesthetic bedroom setups on Instagram. She wants digital experiences that feel warm and handcrafted, not corporate. She'll share Melos screenshots before she's even played her first song. |

**Persona 2 — The Remote Social Connector**

| **Arjun, 27 — Software Engineer (WFH)**                                                                                                                                                                                                                                                                                     |
|                                                                                                                                                                                                                                                                                                                               |
| Arjun has a tight-knit friend group scattered across three cities. They used to share music on drives and at house parties. Now they want a way to listen together online that doesn't feel like a Zoom call. He's the type to maintain a carefully curated playlist and will DM the room link the moment he discovers Melos. |

**Persona 3 — The Curator**

| **Sol, 31 — Freelance Music Blogger**                                                                                                                                                                                                                                                                            |
|                                                                                                                                                                                                                                                                                                                    |
| Sol runs a newsletter about emerging artists. She's always looking for a new format to share listening recommendations. A Melos room is a live editorial experience — she can host themed listening sessions (80s Japanese city pop nights, Sunday jazz hours) and her readers can join, react, and queue songs. |


---

## 5. Core Features
### 5.1. The Melos Player — Hero UI
The centrepiece of the experience is a beautifully illustrated, pixel-perfect vinyl turntable rendered in the browser. It sits on a warm wooden surface with soft ambient lighting. The needle arm moves, the record spins, and the album art appears on the record's label as the song plays. Idle animations (dust particles, subtle grain) make it feel alive even when nothing is playing.

-   Vinyl record renders with accurate rotation speed tied to playback

-   Album art is mapped onto the record label using CSS/WebGL transforms

-   Needle drops with a satisfying micro-animation when a track begins

-   Record lifts and changes when a new song is loaded

-   Stylus tracking line drawn across the record shows playback progress

### 5.2. Song Search & CD Materialisation Flow
When a user searches for a song, the result is not simply added to a list. Instead:

-   A search bar styled as a retro label printer appears

-   Results are shown as jewel-case CD thumbnails with album art

-   The user clicks a result and watches the CD slide out of a dispenser animation

-   The CD floats across the interface and slots physically into the CD player tray

-   The tray closes, the disc spins up, and playback begins

This materialisation flow is the core emotional hook of the product. It must feel smooth, joyful, and never skippable — though animation duration should be configurable for accessibility.

### 5.3. Dual Search Integration
| **Spotify Integration**                                                                                                                                                               |
|                                                                                                                                                                                       |
| OAuth-connected search pulls real metadata, album art, and playback via Spotify Web Playback SDK. Requires Spotify Premium. Provides the highest audio quality and full track access. |

| **YouTube Music Integration**                                                                                                                                                        |
|                                                                                                                                                                                      |
| Falls back to YouTube Music for users without Spotify Premium. Uses YouTube Data API v3 for search + YouTube IFrame Player API for playback. Covers tracks not available on Spotify. |

The search bar intelligently switches source or allows the user to toggle between Spotify and YouTube Music results in a single unified interface.

### 5.4. Multiplayer Rooms
Rooms are the social heart of Melos. A room is a shared listening session with a synchronised playback state, a collaborative queue, and a persistent social layer.

#### Room Creation & Joining

-   Create a named room with optional cover art (generated or uploaded)

-   Generate a shareable 6-character room code or link

-   Sign in via Google OAuth or email/password registration before joining — no anonymous access

-   Room capacity: up to 50 concurrent listeners (MVP); up to 200 (v2)

#### Synchronised Playback

-   Host controls playback; all participants hear the same track at the same timestamp

-   Latency compensation via WebSocket timestamps (target: \< 500ms drift across participants)

-   Host can transfer DJ control to another participant

#### Collaborative Queue

-   Any participant can add songs to the queue

-   Queue rendered as a stack of CDs in a jewel-case rack

-   Upvote/downvote system to surface popular queued tracks

-   Host can lock queue to prevent additions

### 5.5. Interactive Elements — Beyond the Player
Melos is explicitly not just a music player. The following interactive elements make it a living, social art space:

#### Mood Board Walls

Each room has a shared Mood Board — a cork board / tape aesthetic canvas where users can pin images, GIFs, doodles, and text notes that reflect the vibe of the session. Content persists for the session and can be saved as a poster.

#### Reaction Orbs

Instead of standard emoji reactions, users release floating orbs that drift upward across the screen, morphing colour based on the musical key and tempo of the current track. Reactions are visualised collectively as an aurora effect around the Melos player.

#### Live Drawing Canvas

A shared mini whiteboard accessible from a side drawer. Users can sketch, doodle, or write in real time while music plays. Great for collaborative album art creation or just passing notes.

#### Song Lore Cards

Each track that plays generates an auto-fetched Lore Card: an illustrated card showing the artist, release year, a fun fact, and a "sounds like" mood tag. Cards are collectible and saveable to a personal library.

#### Waveform Visualiser

A real-time audio waveform or frequency visualiser that pulses gently behind the Melos player. Three visual themes: Retro Scope (oscilloscope style), Aurora (flowing gradients), and Minimal (thin bar graph).

#### The Crate Dig

A side panel styled as a vinyl crate where AI suggests thematically similar tracks based on what's been played in the room. Users can pull a record out of the crate and queue it with a drag-and-drop gesture.

#### Room Snapshot

At any point, a user can take a "Snapshot" — a beautiful generated image combining the current album art, room name, active listeners' avatars, and the song playing. Shareable to social media.


---

## 6. Technical Architecture
### 6.1. Frontend
  ---------------------- ----------------------------------------------------------------
  **Layer**              **Technology**

  **Framework**          React 18 + TypeScript

  **Animations**         Framer Motion + CSS Houdini / WebGL (Three.js for 3D elements)

  **State Management**   Zustand (local) + React Query (server state)

  **Real-time**          Socket.io client

  **Audio Playback**     Spotify Web Playback SDK + YouTube IFrame API

  **Styling**            Tailwind CSS + CSS Modules for component-level isolation

  **Canvas / Drawing**   Fabric.js for shared whiteboard
  ---------------------- ----------------------------------------------------------------

### 6.2. Backend
  ---------------------- --------------------------------------------------------------------------
  **Layer**              **Technology**

  **API Server**         Node.js + Express (REST endpoints)

  **Real-time Server**   Socket.io (WebSocket rooms, sync events)

  **Database**           PostgreSQL (users, rooms, playlists) + Redis (room state, session cache)

  **Auth**               OAuth 2.0 (Spotify) + JWT sessions

  **File Storage**       Cloudflare R2 (user uploads, snapshots)

  **CDN**                Cloudflare

  **Hosting**            Railway or Render (MVP); AWS ECS (scale)
  ---------------------- --------------------------------------------------------------------------

### 6.3. Key Technical Challenges
-   Playback sync across participants: Use a server-side clock anchor. Each client receives a play event with an absolute server timestamp; clients adjust local playback start accordingly.

-   Spotify API rate limits: Cache search results aggressively in Redis (TTL 10 min). Implement client-side debounce on search input.

-   CD materialisation animation performance: Pre-render animation frames on asset load. Use CSS transforms (GPU-accelerated) rather than JavaScript-driven position changes.

-   Shared canvas conflict resolution: Operational Transform (OT) or CRDT for the whiteboard to prevent cursor conflicts between simultaneous drawers.


---

## 7. Design Language & Principles
### 7.1. Aesthetic Direction
Vinyl's visual identity sits at the intersection of late-90s music nostalgia and contemporary editorial design. Think: the warmth of a bedroom record collection, the tactile joy of opening a CD jewel case, the glow of neon on vinyl, and the lushness of an illustrated music zine.

-   Colour palette: Deep purple-blacks, warm lavenders, dusty pinks, gold accents on black surfaces.

-   Typography: A humanist serif for headings (conveys warmth), a clean geometric mono for track data (conveys precision).

-   Textures: Subtle grain on surfaces, soft shadows, slight vignettes. Nothing flat or corporate.

-   Motion: Every transition should feel intentional, analogue-inspired — the weight of a tonearm lowering, the satisfying click of a CD tray. Never instant. Never janky.

### 7.2. Core Design Principles
| **1. Every Interaction is a Ceremony**                                                                                                                     |
|                                                                                                                                                            |
| Searching, selecting, and playing a track should feel meaningful. The CD materialisation flow is non-negotiable — it is the product's signature gesture. |

| **2. Social Without Social Anxiety**                                                                                 |
|                                                                                                                      |
| Reactions and presence indicators should feel ambient, not performative. Users should feel accompanied, not watched. |

| **3. Beauty is Functional**                                                                                                   |
|                                                                                                                               |
| Visual richness should never impede usability. The interface must be as effortless to navigate as it is beautiful to look at. |

| **4. Accessibility as a Creative Constraint**                                                                                                      |
|                                                                                                                                                    |
| Motion can be reduced. Contrast must meet WCAG AA. Screen readers must be able to navigate core flows. Accessibility drives better design choices. |


---

## 8. Scope & Phased Roadmap

| **Phase**                    | **Deliverables**                                     |

| **Phase 1 MVP (0--3 mo)**    | -   Vinyl player UI (static, single user)            |
|                              |                                                      |
|                              | -   Spotify OAuth + search integration               |
|                              |                                                      |
|                              | -   CD materialisation animation                     |
|                              |                                                      |
|                              | -   Basic room creation + join (up to 10 users)      |
|                              |                                                      |
|                              | -   Synchronised playback via WebSocket              |
|                              |                                                      |
|                              | -   Shared queue with upvoting                       |
|                              |                                                      |
|                              | -   Waveform visualiser (Minimal theme)              |

| **Phase 2 Social (3--6 mo)** | -   YouTube Music fallback integration               |
|                              |                                                      |
|                              | -   Reaction Orbs system                             |
|                              |                                                      |
|                              | -   Mood Board Wall                                  |
|                              |                                                      |
|                              | -   Song Lore Cards                                  |
|                              |                                                      |
|                              | -   Room Snapshot (shareable image)                  |
|                              |                                                      |
|                              | -   User profiles + saved rooms                      |
|                              |                                                      |
|                              | -   Mobile-responsive layout                         |

| **Phase 3 Art (6ₓ12 mo)**    | -   Live Drawing Canvas (shared whiteboard)          |
|                              |                                                      |
|                              | -   The Crate Dig (AI recommendations)               |
|                              |                                                      |
|                              | -   Room themes / custom skins                       |
|                              |                                                      |
|                              | -   Public rooms discovery feed                      |
|                              |                                                      |
|                              | -   Waveform themes (Retro Scope, Aurora)            |
|                              |                                                      |
|                              | -   Room recording + playback replay                 |
|                              |                                                      |
|                              | -   API for third-party room embeds                  |

### 5.6. Video Presence — Faces Behind the Music
Melos is a shared experience, and sometimes the most meaningful part of listening together is simply seeing each other's faces. Video Presence lets room participants optionally turn on their webcam, placing small floating video bubbles alongside the vinyl player without ever overpowering the musical aesthetic.

#### How It Works

-   A camera icon appears in each user's presence indicator at the bottom of the room

-   Clicking it requests webcam permission and activates a live video feed

-   Video bubbles render as soft circular frames with a warm vignette border, matching the room's visual language

-   Bubbles can be dragged and repositioned anywhere on the canvas

-   Up to 8 simultaneous video feeds per room (MVP); expandable grid view in v2

-   Hovering a bubble reveals the participant's name and a mute / expand button

-   An opt-in "beat pulse" subtly animates the bubble border in sync with the music

#### Privacy & Controls

-   Camera is always OFF by default; must be explicitly enabled per session

-   Room hosts can disable video entirely via room settings

-   Participants can hide all video feeds locally without affecting others' views

-   No video is ever recorded or stored — all streams are peer-to-peer via WebRTC

-   Blurred background option available using MediaStream + Canvas API compositing

#### Technical Implementation

-   WebRTC via simple-peer (MVP) or mediasoup SFU (scale) handles peer connections

-   Signalling routed through the existing WebSocket server — no separate signalling infrastructure at MVP scale

-   For rooms exceeding 8 video participants, automatically promote to SFU to prevent bandwidth explosion

-   Graceful degradation: if WebRTC is blocked by network or browser policy, video stays unavailable with a friendly tooltip rather than an error

### 5.7. Virtual Bouquet — Pick, Arrange & Send Flowers
One of Vinyl's core philosophies is that music listening should feel like an act of care. The Virtual Bouquet system extends this into the social layer: users handpick flowers, arrange them into a personal bouquet, and send it across the room as a heartfelt gesture — a digital equivalent of passing someone flowers at a live show.

#### The Eight Flowers

  ---------- ------------------------ ----------------------------------------------------------------------------------------
  **\#**     **Flower**               **Mood & Visual Style**

  **1**      **Red Rose**             Classic love and admiration. Velvety crimson petals with a golden centre.

  **2**      **Sunflower**            Joy and warmth. A burst of golden yellow — the musical equivalent of a chorus drop.

  **3**      **Lavender**             Calm and nostalgia. Soft purple sprigs that evoke summer evenings and lo-fi playlists.

  **4**      **White Daisy**          Innocence and delight. Simple, cheerful, impossible not to smile at.

  **5**      **Peony**                Abundance and romance. Full, lush pink blooms that feel like a slow ballad.

  **6**      **Blue Forget-Me-Not**   Memory and longing. Tiny cerulean blossoms for songs that take you somewhere far away.

  **7**      **Yellow Tulip**         Cheerfulness and new beginnings. Clean lines, bright colour, upbeat energy.

  **8**      **Dried Pampas Grass**   Bohemian softness. Feathery neutral tones for the late-night, lo-fi listener.
  ---------- ------------------------ ----------------------------------------------------------------------------------------

#### Building a Bouquet

-   A "Build Bouquet" tray slides up from the bottom, displaying all 8 flowers as illustrated tiles

-   Click or drag flowers into the bouquet preview area — up to 8 stems per bouquet

-   The preview renders as a live animated illustration that rearranges itself as flowers are added

-   Duplicate flowers are allowed (e.g. three roses for extra emphasis)

-   A "Shuffle Arrangement" button randomly re-positions stems for a different look

-   Choose a wrapping style from 4 options: kraft paper, pink tissue, clear cellophane, or black matte ribbon

#### Sending the Bouquet

-   Select a recipient from the active room participant list

-   An animated delivery plays: the bouquet floats across the screen toward the recipient's avatar with a ribbon trail effect

-   The recipient sees a full-screen moment: the bouquet "lands" with a gentle confetti burst and the sender's name displayed

-   The recipient clicks to "accept" — a small bouquet icon then persists near their avatar for the rest of the session

-   Bouquet compositions can be saved to a personal "Garden" for instant reuse in future rooms

### 5.8. Virtual Cards — Write, Seal & Send
Cards are the quieter, more intimate companion to the bouquet. Users pick an illustrated greeting card, write a personal message inside, sign it, and send it across the room. Perfect for song dedications, inside jokes, or simply saying: "this one made me think of you."

**The Eight Card Designs**

  ---------- --------------------- -----------------------------------------------------------------------------------------
  **\#**     **Card Name**         **Illustration Description**

  **1**      **Midnight Record**   Deep indigo background, a lit turntable, gold stars spilling from the speaker grille.

  **2**      **Garden Radio**      A vintage transistor radio in a wildflower meadow; pastel sunrise tones.

  **3**      **Cassette Crush**    A pink cassette tape with a heart-shaped window; unmistakably 80s and warm.

  **4**      **Stargazer**         Two silhouettes on a hill, sharing headphones under a meteor shower.

  **5**      **Coffee & Vinyl**    A steaming mug next to a spinning record on a wooden table; cosy morning palette.

  **6**      **Neon Dusk**         City skyline at dusk with music notes rising like smoke; deep purples and burnt orange.

  **7**      **Pressed Flowers**   Botanical illustration: pressed petals and leaves framing a blank writing space.

  **8**      **The Note**          A handwritten musical staff with a single melody, on aged cream paper.
  ---------- --------------------- -----------------------------------------------------------------------------------------

#### Composing a Card

The card composer opens as a focused overlay styled like a real writing desk. The selected card illustration fills one side; the writing interface sits beside it.

| **Card Front**                                                                                                                                                                                   |
|                                                                                                                                                                                                  |
| The chosen illustration is shown full-size. Users can optionally drag up to 3 stickers from a set of 12 (stars, hearts, music notes, cassettes, tiny flowers) onto the card face before sending. |

| **Message Body**                                                                                                                                                  |
|                                                                                                                                                                   |
| A lined textarea styled to look like writing paper. Accepts up to 280 characters. A font chooser offers 3 styles: Cursive Warm, Print Block, and Typewriter Mono. |

| **From: Field**                                                                                                                                                                                                                                                                                                                                        |
|                                                                                                                                                                                                                                                                                                                                                        |
| A dedicated signature line at the bottom of the card interior — subtly underlined, pre-filled with the sender's display name but fully editable. Users can sign off as a nickname, an inside joke name, or simply "a friend." This field is intentionally separate from the message body so the sign-off always reads as a distinct, personal touch. |

#### Sending a Card

-   Select a recipient from the room participant list

-   Click "Seal & Send" — the card folds into an envelope, the envelope seals with an animated wax stamp, then floats across the screen toward the recipient

-   The recipient's presence indicator pulses with a small envelope icon

-   Clicking the envelope opens a full reveal: it unfolds, the card opens, and the message reads in the chosen font

-   Received cards are saveable to a personal "Memory Box" accessible from the user's profile

-   A bouquet and card can be sent together as a single "Gift Bundle" in one gesture

#### Safety & Moderation

-   Message content is filtered through a profanity and harassment check before delivery

-   Recipients can block a sender, preventing any further cards or bouquets from that user in any room

-   Cards are strictly one-to-one and cannot be forwarded or broadcast to the whole room


---

## 9. Out of Scope (v1)
-   Native iOS / Android apps (PWA considered in Phase 2)

-   Music uploads / user-hosted audio

-   Monetisation features (subscriptions, tips)

-   Podcast support

-   DM / private messaging between users

-   Full content moderation tooling (deferred to a later stage — see Section 11.3)


---

## 10. Risks & Mitigations
  -------------------------------------------------- ------------------ -------------------------------------------------------------------------------------------
  **Risk**                                           **Likelihood**     **Mitigation**

  Spotify API policy changes or revocation           **Medium**         Maintain YouTube Music as primary fallback; design API layer to be swappable

  CD animation drops frames on low-end devices       **High**           Offer reduced-motion mode; pre-render animation atlas; test on mid-range Android

  WebSocket sync drift in high-latency connections   **Medium**         Implement NTP-style server clock sync; allow host-only playback fallback mode

  Low adoption without Spotify Premium               **High**           Ensure YouTube Music path is fully first-class, not second-tier

  Copyright / DMCA issues with Song Lore cards       **Low**            Confirmed: API-sourced only (Spotify + MusicBrainz). No AI generation, no audio snippets.
  -------------------------------------------------- ------------------ -------------------------------------------------------------------------------------------


---

## 11. Resolved Decisions
The following questions have been answered and locked. These decisions are now reflected throughout the relevant feature sections.

### 11.1. Authentication
| **Decision: Google Login + Email/Password**                                                                                                                                                                                                                                                                                                                          |
|                                                                                                                                                                                                                                                                                                                                                                      |
| Rooms require authentication to join. Users can sign in via Google OAuth (one-click, frictionless) or manually register with an email address and a chosen password. The manual registration flow uses a warm, humanist serif typeface for all form labels, inputs, and CTAs — consistent with Melos's overall design language. Anonymous access is not supported. |

### 11.2. CD Player Skins
| **Decision: Unlockable Alternative Skins**                                                                                                                                                                                                                                                                                                                                                                                                              |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| The CD player is not the only visual mode. Users can unlock a set of alternative interactive player skins. Each skin changes the opening and closing animation, the surface texture, the tray mechanism, and the idle state of the player. Skins are cosmetic only — all functional behaviour (play, pause, queue, sync) is identical across skins. The unlock mechanic will be defined in Phase 2 (e.g. time-based, room milestone, or collectible). |

Planned skin directions:

-   CD Player — default. Jewel-case tray, glassy surface, satisfying click mechanism.

-   Reel-to-Reel — large tape reels spin in sync with playback. Industrial, cinematic.

-   Cassette Deck — tape window shows spools turning. Warm, lo-fi, 80s bedroom aesthetic.

-   Vinyl Turntable — tonearm lowers onto a spinning record. The most tactile and nostalgic.

-   MiniDisc Player — sliding door mechanism, tiny disc. Niche but deeply beloved.

### 11.3. Content Moderation
| **Decision: Deferred to a Later Stage**                                                                                                                                                                                                                                                                                                                                                                                          |
|                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Full content moderation tooling for shared surfaces (Mood Boards, Drawing Canvases, Cards) will be scoped and implemented in a later development phase. For MVP, basic profanity filtering on card messages is sufficient. A full moderation strategy — including reporting flows, host controls, and automated flagging — will be designed as a dedicated workstream when the social features reach meaningful usage scale. |

### 11.4. Song Lore Cards
| **Decision: API-Sourced Only**                                                                                                                                                                                                                                                                                                                                                                                                |
|                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Lore Card content is sourced entirely from licensed third-party APIs — primarily Spotify metadata and MusicBrainz. No AI-generated content is used in Lore Cards. This ensures factual accuracy, consistent quality, and zero hallucination risk. Fields covered: artist name, album, release year, genre tags, mood descriptors, and a "sounds like" tag derived from audio feature data. Cards are not editable by users. |

### 11.5. Business Model & Tiers
| **Decision: No Tiers at This Stage**                                                                                                                                                                                                                                                     |
|                                                                                                                                                                                                                                                                                          |
| Melos launches with a single, fully featured tier available to all users. There are no room limits, feature gates, or premium paywalls at this stage. Monetisation strategy will be revisited in a future phase once the core experience has been validated and a user base established. |


---

## 12. UI Implementation Reference
This section documents both opening screens of Melos with full source code. Both files are standalone HTML with no external dependencies and serve as the canonical implementation reference for developers.

### 12.1. Design Principles Applied
| **Cursor-Reactive Line Animation**                                                                                                                                                                                                                       |
|                                                                                                                                                                                                                                                          |
| Procedurally generated vertical lines of uneven width detect cursor proximity per-frame via canvas mousemove. Each line lerps its colour toward cream-white (#FDFEF5) on hover at 12% per frame, reverting fluidly on exit. Lines regenerate every load. |

| **Glassy Card Surfaces**                                                                                                                                                             |
|                                                                                                                                                                                      |
| All UI panels use backdrop-filter: blur(24px) with rgba(67,56,80,0.45) background and 1px rgba(203,170,203,0.22) border, creating a frosted-glass material over the animated canvas. |

| **Custom Cursor**                                                                                                                   |
|                                                                                                                                     |
| System cursor hidden via cursor:none. Replaced by an 8px lavender dot (#CBAACB) tracking the mouse. Consistent across both screens. |

| **Typography**                                                                                                                                             |
|                                                                                                                                                            |
| All text uses Georgia serif with no external font loading. Form labels: 10px spaced caps. Wordmark MELOS: letter-spacing:8px. Tagline: letter-spacing:4px. |

### 12.2. Colour Tokens Used in Both Screens
  -------------------- ------------- -------------------------------------------
  **Name**             **Hex**       **UI Role**

  **Deep Purple**      **#433850**   Page background, line base colour

  **Cream White**      **#FDFEF5**   Line hover colour, body text, input text

  **Soft Lavender**    **#CBAACB**   Logo M, cursor dot, labels, glass borders

  **Chocolate Plum**   **#6B3F3F**   Divider line, line variant colour

  **Slate Blue**       **#454859**   Line variant colour, depth layer
  -------------------- ------------- -------------------------------------------

### 12.3. Screen 1 — Landing Page (index.html)
-   Lines 10--32px wide, random wobble paths, regenerated on every load

-   Hover: lerpColor(lineColour, #FDFEF5, hoverAmt) easing at 12% per animation frame

-   Enter button: backdrop-filter:blur(8px), rgba(203,170,203,0.12) background

-   Hint label fades on first cursor movement

-   onclick fires location.href='login.html' — replace with your router push

**Full source — index.html (no external dependencies)**

\<!DOCTYPE html\> \<html lang=\"en\"\> \<head\> \<meta charset=\"UTF-8\"/\> \<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/\> \<title\>Melos\</title\> \<style\> \* { margin:0; padding:0; box-sizing:border-box; } body { width:100vw; height:100vh; background:#433850; overflow:hidden; cursor:none; font-family:Georgia,serif; } canvas { position:fixed; inset:0; width:100%; height:100%; } #cursor-dot { position:fixed; width:8px; height:8px; background:#CBAACB; border-radius:50%; pointer-events:none; transform:translate(-50%,-50%); transition:opacity 0.3s; z-index:10; } #overlay { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; z-index:5; } #logo-m { font-size:96px; font-weight:400; color:#CBAACB; line-height:1; } #divider-line { width:1px; height:32px; background:#6B3F3F; margin:10px 0; } #logo-word { font-size:18px; color:#FDFEF5; letter-spacing:8px; } #tagline { font-size:11px; color:#CBAACB; letter-spacing:4px; margin-top:6px; opacity:0.7; } #glass-btn { margin-top:36px; pointer-events:all; padding:12px 36px; border-radius:999px; background:rgba(203,170,203,0.12); border:1px solid rgba(203,170,203,0.35); color:#FDFEF5; font-family:Georgia,serif; font-size:13px; letter-spacing:3px; cursor:pointer; backdrop-filter:blur(8px); } #glass-btn:hover { background:rgba(203,170,203,0.22); } #hint { position:fixed; bottom:20px; width:100%; text-align:center; font-size:11px; color:rgba(203,170,203,0.4); letter-spacing:2px; pointer-events:none; z-index:5; transition:opacity 0.5s; } \</style\> \</head\> \<body\> \<canvas id=\"canvas\"\>\</canvas\> \<div id=\"cursor-dot\"\>\</div\> \<div id=\"overlay\"\> \<div id=\"logo-m\"\>M\</div\> \<div id=\"divider-line\"\>\</div\> \<div id=\"logo-word\"\>MELOS\</div\> \<div id=\"tagline\"\>music together\</div\> \<button id=\"glass-btn\" onclick=\"location.href=\'login.html\'\"\>enter\</button\> \</div\> \<div id=\"hint\"\>move your cursor\</div\> \<script\> const canvas=document.getElementById(\'canvas\'); const ctx=canvas.getContext(\'2d\'); const dot=document.getElementById(\'cursor-dot\'); const C={bg:\'#433850\',cream:\'#FDFEF5\',lavender:\'#CBAACB\',plum:\'#6B3F3F\',slate:\'#454859\'}; const LINE_COLORS=\[C.lavender,C.plum,C.slate,\'#5C4A6A\',\'#7A5C5C\',\'#3D3F52\',\'#8B7A9B\',\'#4A5068\'\]; let W,H,lines=\[\],mouse={x:-999,y:-999},animId; function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;buildLines();draw();} function buildLines(){lines=\[\];let x=0;const count=Math.floor(W/18)+2;for(let i=0;i\<count;i++){const w=10+Math.random()\*22;lines.push({x,w,pts:makePath(x,w),color:LINE_COLORS\[i%LINE_COLORS.length\],hoverAmt:0});x+=w+1+Math.random()\*6;}} function makePath(x,w){const pts=\[\];const segs=8+Math.floor(Math.random()\*6);for(let i=0;i\<=segs;i++){pts.push({x:x+(Math.random()-.5)\*w\*0.6,y:(i/segs)\*H});}return pts;} function lineContainsMouse(l){const pts=l.pts;for(let i=0;i\<pts.length-1;i++){const p0=pts\[i\],p1=pts\[i+1\];if(mouse.y\<p0.y\|\|mouse.y\>p1.y)continue;const t=(mouse.y-p0.y)/(p1.y-p0.y);if(Math.abs(mouse.x-(p0.x+t\*(p1.x-p0.x)))\<l.w\*0.7+8)return true;}return false;} function lerpColor(a,b,t){const ah=a.replace(\'#\',\'\'),bh=b.replace(\'#\',\'\');const ar=parseInt(ah.slice(0,2),16),ag=parseInt(ah.slice(2,4),16),ab=parseInt(ah.slice(4,6),16);const br=parseInt(bh.slice(0,2),16),bg=parseInt(bh.slice(2,4),16),bb=parseInt(bh.slice(4,6),16);return \`rgb(\${Math.round(ar+(br-ar)\*t)},\${Math.round(ag+(bg-ag)\*t)},\${Math.round(ab+(bb-ab)\*t)})\`;} function drawLine(l){const pts=l.pts;ctx.beginPath();ctx.moveTo(pts\[0\].x+l.w/2,pts\[0\].y);for(let i=1;i\<pts.length;i++){const p=pts\[i-1\],c=pts\[i\];ctx.quadraticCurveTo(p.x+l.w/2,p.y,(p.x+c.x)/2+l.w/2,(p.y+c.y)/2);}ctx.lineTo(pts\[pts.length-1\].x+l.w/2,pts\[pts.length-1\].y);ctx.lineWidth=l.w\*(1+l.hoverAmt\*0.15);ctx.strokeStyle=lerpColor(l.color,C.cream,l.hoverAmt);ctx.globalAlpha=0.55+l.hoverAmt\*0.45;ctx.lineCap=\'round\';ctx.stroke();ctx.globalAlpha=1;} function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);lines.forEach(drawLine);} function tick(){let d=false;lines.forEach(l=\>{const tgt=lineContainsMouse(l)?1:0;const p=l.hoverAmt;l.hoverAmt+=(tgt-l.hoverAmt)\*0.12;if(Math.abs(l.hoverAmt-p)\>0.002)d=true;});if(d)draw();animId=requestAnimationFrame(tick);} document.addEventListener(\'mousemove\',e=\>{mouse.x=e.clientX;mouse.y=e.clientY;dot.style.left=e.clientX+\'px\';dot.style.top=e.clientY+\'px\';dot.style.opacity=\'1\';document.getElementById(\'hint\').style.opacity=\'0\';}); document.addEventListener(\'mouseleave\',()=\>{mouse.x=-999;mouse.y=-999;dot.style.opacity=\'0\';}); window.addEventListener(\'resize\',()=\>{cancelAnimationFrame(animId);resize();}); resize();tick(); \</script\> \</body\> \</html\>

### 12.4. Screen 2 — Login / Register (login.html)
-   Card: backdrop-filter:blur(24px), rgba(67,56,80,0.45) bg, 1px rgba(203,170,203,0.22) border

-   Google button fires location.href='/auth/google' OAuth redirect

-   Toggle switches between sign in and create account without page reload

-   Input focus state: rgba(203,170,203,0.55) border, rgba(253,254,245,0.09) background

**Full source — login.html (no external dependencies)**

\<!DOCTYPE html\> \<html lang=\"en\"\> \<head\> \<meta charset=\"UTF-8\"/\> \<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/\> \<title\>Melos - Sign In\</title\> \<style\> \* { margin:0; padding:0; box-sizing:border-box; } body { width:100vw; height:100vh; background:#433850; overflow:hidden; cursor:none; font-family:Georgia,serif; } canvas { position:fixed; inset:0; width:100%; height:100%; pointer-events:none; } #cursor-dot { position:fixed; width:8px; height:8px; background:#CBAACB; border-radius:50%; pointer-events:none; transform:translate(-50%,-50%); z-index:10; opacity:0; transition:opacity 0.3s; } #glass-card { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:5; } .card { width:340px; background:rgba(67,56,80,0.45); border:1px solid rgba(203,170,203,0.22); border-radius:24px; backdrop-filter:blur(24px); padding:40px 36px 36px; display:flex; flex-direction:column; align-items:center; } .card-logo-m { font-size:52px; font-weight:400; color:#CBAACB; line-height:1; } .card-divider { width:1px; height:20px; background:#6B3F3F; margin:8px 0 6px; } .card-word { font-size:13px; color:#FDFEF5; letter-spacing:6px; } .card-tagline { font-size:10px; color:#CBAACB; letter-spacing:3px; opacity:0.65; margin-top:4px; } .card-sep { width:100%; height:1px; background:rgba(203,170,203,0.15); margin:28px 0 24px; } .google-btn { width:100%; padding:11px 0; border-radius:999px; background:rgba(253,254,245,0.08); border:1px solid rgba(253,254,245,0.2); color:#FDFEF5; font-family:Georgia,serif; font-size:12px; letter-spacing:2px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; } .google-btn:hover { background:rgba(253,254,245,0.15); } .or-row { display:flex; align-items:center; gap:12px; width:100%; margin:20px 0 18px; } .or-line { flex:1; height:1px; background:rgba(203,170,203,0.15); } .or-text { font-size:10px; color:rgba(203,170,203,0.5); letter-spacing:2px; } .field { width:100%; margin-bottom:12px; } .field label { display:block; font-size:10px; color:rgba(203,170,203,0.6); letter-spacing:2px; margin-bottom:6px; } .field input { width:100%; padding:10px 14px; border-radius:12px; background:rgba(253,254,245,0.06); border:1px solid rgba(203,170,203,0.18); color:#FDFEF5; font-family:Georgia,serif; font-size:13px; outline:none; } .field input::placeholder { color:rgba(203,170,203,0.3); } .field input:focus { border-color:rgba(203,170,203,0.55); background:rgba(253,254,245,0.09); } .submit-btn { width:100%; padding:12px 0; border-radius:999px; margin-top:6px; background:rgba(203,170,203,0.18); border:1px solid rgba(203,170,203,0.4); color:#FDFEF5; font-family:Georgia,serif; font-size:12px; letter-spacing:3px; cursor:pointer; } .submit-btn:hover { background:rgba(203,170,203,0.28); } .toggle-row { margin-top:16px; font-size:10px; color:rgba(203,170,203,0.45); letter-spacing:1px; text-align:center; } .toggle-link { color:#CBAACB; cursor:pointer; text-decoration:underline; } \</style\> \</head\> \<body\> \<canvas id=\"canvas\"\>\</canvas\> \<div id=\"cursor-dot\"\>\</div\> \<div id=\"glass-card\"\> \<div class=\"card\"\> \<div class=\"card-logo-m\"\>M\</div\> \<div class=\"card-divider\"\>\</div\> \<div class=\"card-word\"\>MELOS\</div\> \<div class=\"card-tagline\"\>music together\</div\> \<div class=\"card-sep\"\>\</div\> \<button class=\"google-btn\" onclick=\"location.href=\'/auth/google\'\"\>continue with google\</button\> \<div class=\"or-row\"\>\<div class=\"or-line\"\>\</div\>\<span class=\"or-text\"\>or\</span\>\<div class=\"or-line\"\>\</div\>\</div\> \<div class=\"field\"\>\<label\>email\</label\>\<input type=\"email\" placeholder=\"you@example.com\"/\>\</div\> \<div class=\"field\"\>\<label\>password\</label\>\<input type=\"password\" placeholder=\"\...\.....\"/\>\</div\> \<button class=\"submit-btn\" id=\"submit-btn\"\>sign in\</button\> \<div class=\"toggle-row\"\>no account? \<span class=\"toggle-link\" id=\"toggle\"\>create one\</span\>\</div\> \</div\> \</div\> \<script\> const canvas=document.getElementById(\'canvas\'); const ctx=canvas.getContext(\'2d\'); const dot=document.getElementById(\'cursor-dot\'); const C={bg:\'#433850\',cream:\'#FDFEF5\',lavender:\'#CBAACB\',plum:\'#6B3F3F\',slate:\'#454859\'}; const LINE_COLORS=\[C.lavender,C.plum,C.slate,\'#5C4A6A\',\'#7A5C5C\',\'#3D3F52\',\'#8B7A9B\',\'#4A5068\'\]; let W,H,lines=\[\],mouse={x:-999,y:-999},animId; function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;buildLines();draw();} function buildLines(){lines=\[\];let x=0;const count=Math.floor(W/18)+2;for(let i=0;i\<count;i++){const w=10+Math.random()\*22;lines.push({x,w,pts:makePath(x,w),color:LINE_COLORS\[i%LINE_COLORS.length\],hoverAmt:0});x+=w+1+Math.random()\*6;}} function makePath(x,w){const pts=\[\];const segs=8+Math.floor(Math.random()\*6);for(let i=0;i\<=segs;i++){pts.push({x:x+(Math.random()-.5)\*w\*0.6,y:(i/segs)\*H});}return pts;} function lineContainsMouse(l){const pts=l.pts;for(let i=0;i\<pts.length-1;i++){const p0=pts\[i\],p1=pts\[i+1\];if(mouse.y\<p0.y\|\|mouse.y\>p1.y)continue;const t=(mouse.y-p0.y)/(p1.y-p0.y);if(Math.abs(mouse.x-(p0.x+t\*(p1.x-p0.x)))\<l.w\*0.7+8)return true;}return false;} function lerpColor(a,b,t){const ah=a.replace(\'#\',\'\'),bh=b.replace(\'#\',\'\');const ar=parseInt(ah.slice(0,2),16),ag=parseInt(ah.slice(2,4),16),ab=parseInt(ah.slice(4,6),16);const br=parseInt(bh.slice(0,2),16),bg=parseInt(bh.slice(2,4),16),bb=parseInt(bh.slice(4,6),16);return \`rgb(\${Math.round(ar+(br-ar)\*t)},\${Math.round(ag+(bg-ag)\*t)},\${Math.round(ab+(bb-ab)\*t)})\`;} function drawLine(l){const pts=l.pts;ctx.beginPath();ctx.moveTo(pts\[0\].x+l.w/2,pts\[0\].y);for(let i=1;i\<pts.length;i++){const p=pts\[i-1\],c=pts\[i\];ctx.quadraticCurveTo(p.x+l.w/2,p.y,(p.x+c.x)/2+l.w/2,(p.y+c.y)/2);}ctx.lineTo(pts\[pts.length-1\].x+l.w/2,pts\[pts.length-1\].y);ctx.lineWidth=l.w\*(1+l.hoverAmt\*0.15);ctx.strokeStyle=lerpColor(l.color,C.cream,l.hoverAmt);ctx.globalAlpha=0.55+l.hoverAmt\*0.45;ctx.lineCap=\'round\';ctx.stroke();ctx.globalAlpha=1;} function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);lines.forEach(drawLine);} function tick(){let d=false;lines.forEach(l=\>{const tgt=lineContainsMouse(l)?1:0;const p=l.hoverAmt;l.hoverAmt+=(tgt-l.hoverAmt)\*0.12;if(Math.abs(l.hoverAmt-p)\>0.002)d=true;});if(d)draw();animId=requestAnimationFrame(tick);} document.addEventListener(\'mousemove\',e=\>{mouse.x=e.clientX;mouse.y=e.clientY;dot.style.left=e.clientX+\'px\';dot.style.top=e.clientY+\'px\';dot.style.opacity=\'1\';}); document.addEventListener(\'mouseleave\',()=\>{mouse.x=-999;mouse.y=-999;dot.style.opacity=\'0\';}); window.addEventListener(\'resize\',()=\>{cancelAnimationFrame(animId);resize();}); document.getElementById(\'toggle\').addEventListener(\'click\',function(){const isSignIn=this.textContent===\'create one\';this.textContent=isSignIn?\'sign in instead\':\'create one\';document.getElementById(\'submit-btn\').textContent=isSignIn?\'create account\':\'sign in\';}); resize();tick(); \</script\> \</body\> \</html\>


---

## 13. Brand Identity & Design System
### 13.1. Name
The product is named Melos — from the ancient Greek μέλος, meaning the unified whole of music, lyric, and bodily movement. The Greeks understood these could not be separated: you do not merely hear a song, you feel it move through you. Melos captures exactly what this product is — not a music player, but a total sensory and social experience.

Official casing: MELOS in logo contexts, Melos in prose and UI. Never melos or all-caps in running text.

### 13.2. Domain & Identity
  -------------------- ----------------------------------------------------
  **Primary Domain**   melos.app

  **App Identifier**   app.melos

  **Social Handle**    \@melosapp (reserve across all platforms)

  **Tagline**          music together

  **Full Tagline**     Music Listening Experience turned Art
  -------------------- ----------------------------------------------------

### 13.3. Logo
The primary logo is a monogram lockup: a large serif M on the left, a thin vertical Grape Soda divider line, and the wordmark MELOS in off-white stacked above the tagline 'music together' in Amethyst Smoke on the right. All three variants live on the near-black canvas (#2A1A1B).

  ------------------------------------------------------ --------------------------------------------------------------
  **Variant**                                            **Usage**

  **Primary lockup (M + divider + MELOS + tagline)**     Website header, press kit, loading screen, pitch deck cover

  **Compact lockup (M + divider + MELOS, no tagline)**   Navbar, tight layouts, email signatures, social bios

  **Icon-only M in rounded square**                      App icon, browser favicon, social avatar, notification badge
  ------------------------------------------------------ --------------------------------------------------------------

### 13.4. Colour Palette
The Melos palette is built from three hero colours plus a near-black canvas and an off-white tint. Every colour has a named identity.

  ----------------------- ------------- ------------------------------------------------- --------------------------------------------------------------------------------
  **Name**                **Hex**       **Role**                                          **Emotional intent**

  **Grape Soda**          **#88527F**   Primary / logo wordmark / CTAs                    *The beating heart of the brand. Rich and musical, neither pink nor purple.*

  **Amethyst Smoke**      **#9F87AF**   Accents / reversed type / M monogram / tagline    *Softer and breathier. The haze of a late-night listening session.*

  **Chocolate Plum**      **#614344**   Dark surfaces / card backgrounds / depth layers   *Warm brown-red darkness. A vintage record shop at closing time.*

  **Near-Black Canvas**   **#2A1A1B**   Page bg / hero dark canvas / logo field           *The deepest point of the palette. Where the logo lives at its most dramatic.*

  **Off-White Tint**      **#F7F4F9**   Light backgrounds / paper surfaces                *Slightly warm white. The inside cover of a well-loved album.*
  ----------------------- ------------- ------------------------------------------------- --------------------------------------------------------------------------------

### 13.5. Typography
| **Display / Headings**                                                                                                                                                                                                     |
|                                                                                                                                                                                                                            |
| A humanist serif (e.g. Playfair Display, Cormorant, or Freight Display). Used for the logo, hero headlines, section titles, and Song Lore Cards. Conveys warmth, depth, and the feeling of a handcrafted editorial object. |

| **Body / UI Text**                                                                                                                                                               |
|                                                                                                                                                                                  |
| A clean geometric sans-serif (e.g. DM Sans, Inter, or Instrument Sans). Used for all navigation, buttons, descriptions, and functional text. Legible at small sizes, never cold. |

| **Data / Track Info**                                                                                                                                                  |
|                                                                                                                                                                        |
| A monospace font (e.g. DM Mono or JetBrains Mono). Used for track timestamps, BPM readouts, room codes, and any numerical music data. Conveys precision inside warmth. |

### 13.6. Logo Usage Rules
-   Always place the logo on #2A1A1B (near-black) or #F7F4F9 (off-white) only. Never on a photographic background without a solid colour field behind it.

-   Minimum clear space: the cap-height of the M on all four sides.

-   Never recolour the logo. The three-colour system is fixed: Amethyst Smoke M, Grape Soda divider, off-white MELOS wordmark.

-   Never stretch, rotate, skew, or apply effects such as shadows, outlines, or glows to any logo variant.

-   Never use the tagline 'music together' as a standalone lockup without the logo present on the same surface.


---

## 14. Appendix
**A. Competitive Landscape**

| **Spotify (Jam)**                                                                                                                                                          |
|                                                                                                                                                                            |
| Real-time listening sessions added late 2023. Functional but entirely within Spotify's clinical UI. No visual art layer, no cross-platform support, limited interactivity. |

| **Jqbx / ListenTogether**                                                                                        |
|                                                                                                                  |
| Community-driven listening rooms. Good social mechanics but visually minimal. Largely abandoned or unmaintained. |

| **Discord Stage Channels**                                                                                    |
|                                                                                                               |
| Used for impromptu music sessions via bots. Complex setup, no native music UI, dependent on third-party bots. |

Vinyl's differentiation: It is the only product that treats the visual and tactile act of playing music as the primary product feature, while embedding social presence as a layer on top.

**B. Inspiration References**

-   Aesthetics: Teenage Engineering product design, Dieter Rams principles applied to software

-   Social: Discord Stage, Teleparty (shared viewing)

-   Nostalgia: MiniDisc player UI, early iPod click-wheel interface

-   Visual Art: James Jean illustration style, risograph print textures


*End of Document*

melos — v1.0 PRD — March 2026