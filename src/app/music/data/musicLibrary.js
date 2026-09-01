const PianoIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}><rect x="2" y="6" width="20" height="13" rx="1.5" /><path d="M2 13.5h20" /><path d="M6 13.5V19M10 13.5V19M14 13.5V19M18 13.5V19" /><path d="M5 6v5M8.5 6v5M15.5 6v5M19 6v5" /></svg>
);
const DrumsIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}><ellipse cx="12" cy="17" rx="8" ry="3" /><path d="M4 17V9c0-1.66 3.58-3 8-3s8 1.34 8 3v8" /><ellipse cx="12" cy="9" rx="8" ry="3" /><path d="M7 6.5L5.5 2M17 6.5L18.5 2" /></svg>
);
const GuitarIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}><path d="M9.5 17.5a3.5 3.5 0 1 0 5-5L19 8l-3-3-4.5 4.5a3.5 3.5 0 0 0-2 5z" /><path d="M14.5 9.5l-5 5" /><path d="M17 5l2-2M19 5l-2-2" /></svg>
);
const BassIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}><path d="M8.5 18.5a3.5 3.5 0 1 0 5-5V4.5" /><path d="M13.5 4.5H17M13.5 7.5H16" /><circle cx="10" cy="18.5" r="0.5" fill="currentColor" /></svg>
);

export const musicLibrary = [
  {
    id: "PIANO", 
    label: "Piano Covers", 
    icon: PianoIcon,
    tracks: [
      { 
        id: "piano 01", 
        title: "Liebestraum No. 3 Cover", 
        originalArtist: "Franz Liszt",
        date: "2026.03.11", 
        location: "Talbot College @ Western University", 
        notes: "Really liked the song, best take so far, got to the first 30 seconds. Will update when I learn the full thing.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/liebenstraum-piano.mp4" 
      },
      { 
        id: "piano 02", 
        title: "Sing About Me I'm Dying of Thirst Piano Cover",
        originalArtist: "Kendrick Lamar", 
        date: "2025.02.01", 
        location: "Medway-Sydenham Hall Basement @ Western University", 
        notes: "At a point this was my favourite song so I had to learn it on piano.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/samidot-piano.mp4" 
      },
      { 
        id: "piano 03", 
        title: "Why Try To Change Me Now Cover with Ada",
        originalArtist: "Frank Sinatra", 
        date: "2024.10.29", 
        location: "Medway-Sydenham Hall Basement @ Western University", 
        notes: "Practicing being able to highlight a vocalist when playing piano. Really beautiful son with a great singer!", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/why-try-change-me-now-piano.mp4" 
      },
      { 
        id: "piano 04", 
        title: "One Summer Day Cover",
        originalArtist: "Joe Hisaishi", 
        date: "2025.12.31", 
        location: "The Gate Mall, Qatar", 
        notes: "Was bored in a mall and decided to play a classic.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/studio-ghibli-piano.mp4" 
      } 
    ]
  },
  {
    id: "DRUMS", 
    label: "Percussion", 
    icon: DrumsIcon,
    tracks: [
      { 
        id: "drums 01", 
        title: "Get Lucky — Groove Cover",
        originalArtist: "Daft Punk ft. Pharrell Williams",
        date: "2024.05.29", 
        location: "Gems American Academy", 
        notes: "Testing out Get Lucky with a Reggae Groove. Very Cool and fun to play, ended up performing at Grade 12 Grad.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/get-lucky-drums.MOV" 
      },
      { 
        id: "drums 02", 
        title: "Ironwood Drum Solo - Isn't She Lovely",
        originalArtist: "Stevie Wonder", 
        date: "2023.05.05", 
        location: "The Ironwood Stage and Grill, Calgary", 
        notes: "Last time I performed with this group before I moved from Calgary. Super fun song to play around with and fill to. Miss these guys.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/ironwood-drums.MP4" 
      },
      { 
        id: "drums 03", 
        title: "Sing About Me I'm Dying of Thirst Cover",
        originalArtist: "Kendrick Lamar", 
        date: "2023.03.29", 
        location: "St. Francis Highschool Calgary", 
        notes: "Learnt this song from end to end with my friend and decided to jam to it. First ever jamming video!", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/samidot-drums.mp4" 
      },
      { 
        id: "drums 04", 
        title: "Feeling Good Practice Clip",
        originalArtist: "Michael Bublé", 
        date: "2024.04.24", 
        location: "Gems American Academy", 
        notes: "We had a showcase coming up and this is just a random clip of ideas that we were playing around with that I thought was cool. Shoutout Ghalia(Voice) and Mr. V (Trumpet)", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/feeling-good-drums.mp4" 
      },
      { 
        id: "drums 05", 
        title: "Far Away Jam Session",
        originalArtist: "The Deftones", 
        date: "2023.06.07", 
        location: "St. Francis Highschool Calgary", 
        notes: "During our spare, my good friend and I would sometimes just jam out to our favourite tracks. This is prolly the fatest fill I have ever done LOL. Miss jamming out with Vince.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/far-away-drums.MOV" 
      },
      { 
        id: "drums 06", 
        title: "Careless Whisper Practice Session",
        originalArtist: "George Michael", 
        date: "2023.11.14", 
        location: "Gems American Academy", 
        notes: "Unfortunately I placed my phone down to record this so there is no video but this is a clip from when we practicing for a showcase of careless whisper. Joshua killing it on SAX. Tried to keep it like the original track as much as possibile.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/careless-whisper-drums.mp4",
        audioOnly: true
      },
      { 
        id: "drums 07", 
        title: "Chamber of Reflection Jam Session Take 1",
        originalArtist: "Mac DeMarco", 
        date: "2026.08.04", 
        location: "Carnegie Mellon University Music Room, Qatar", 
        notes: "Ose, Dika, and Shanah quickly learnt how to play this track. I played drums for this and I was exploring how creative I could be with my fills without losing the groove (I lost the groove a couple times LOL). There is a longer take 2 which is better in terms of pocket but I like some of the ideas more here", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/Chamberofreflectiontake1.mp4",
        isFeatured: true,
      },
      { 
        id: "drums 08", 
        title: "Best Part Ending Breakdown",
        originalArtist: "Daniel Caesar ft. H.E.R.", 
        date: "2026.06.30", 
        location: "Carnegie Mellon University Music Room, Qatar", 
        notes: "Me and Dika Jam sessions are always unforgettable, Hes also in CS so we take a break from all that comp sci talk and just jam out. Hes been only playing for a year in this clip, Hes a phenomenal talent.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/BestPartEnding-Drums.MOV" 
      
      },
      { 
        id: "drums 09", 
        title: "Tadow",
        originalArtist: "Masego ft. FKJ", 
        date: "2026.06.30", 
        location: "Carnegie Mellon University Music Room, Qatar", 
        notes: "Me and Dika actually played this song in highschool but at the time I was on guitar and he played drums. Glad to see growth from both of us.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/tadow-drums.mp4" 
      },

    ]
  },
  { 
    id: "GUITAR", 
    label: "Electric Guitar", 
    icon: GuitarIcon, 
    tracks: [
      { 
        id: "guitar 01", 
        title: "Best Part Cover with Isa",
        originalArtist: "Daniel Caesar ft. H.E.R.", 
        date: "2023.09.27", 
        location: "Gems American Academy", 
        notes: "One of the best guitar covers ive ever done. Played with different voicings of the same chord progression. Isas voice fit perfectly as well", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/best-part-guitar.mov",
        isFeatured: true,
      },
      { 
        id: "guitar 02", 
        title: "Mais Que Nada Cover with Maria",
        originalArtist: "Sérgio Mendes", 
        date: "2023.08.14", 
        location: "Maria's Home Studio", 
        notes: "Played one of my favourite samba brazilian songs (Maria is Brazillian!) Super fun to play, wish it on acoustic. Maria an amazing artist and singer, super talented.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/mais-que-nada-guitar.mp4" 
      },

      { 
        id: "guitar 03", 
        title: "Rapp Snitch Knishes",
        originalArtist: "MF Doom ft. Mr Fantastik", 
        date: "2026.06.30", 
        location: "Carnegie Mellon University Music Room, Qatar", 
        notes: "Part of the Dika and Me Jam sessions, his friend from university pulled up and he happened to know one of my favourite songs of all time. Childhood dream to jam out to this track.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/RappKnishSnitches-guitar.mp4",
      },
    ] 
  },
  { 
    id: "BASS",
    label: "Bass Guitar",
    icon: BassIcon,
    tracks: [
      { 
        id: "bass 01", 
        title: "Black Orpheus Cover",
        originalArtist: "Luiz Bonfá", 
        date: "2023.06.25", 
        location: "Aslyum for Art, Calgary", 
        notes: "My first experience of OPEN MIC. Drummer had never played with us before so was cool to bounce off ideas musically mid performance.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/black-orpheus-bass.mp4" 
      },
      { 
        id: "bass 02", 
        title: "Fletchers Song in Club Cover",
        originalArtist: "Justin Hurwitz", 
        date: "2023.05.05", 
        location: "The Ironwood Stage and Grill, Calgary", 
        notes: "Opening song in our setlist from Whiplash Movie. Cool jazz vibes for a stage and grill bar. Was relatively new to playing bass.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/fletchers-song-in-club-bass.mp4" 
      },
      { 
        id: "bass 03", 
        title: "Redbone Jam",
        originalArtist: "Childish Gambino", 
        date: "2024.02.07", 
        location: "Gems American Academy", 
        notes: "No clue why I was in a suit. Looked fly though. Super fun 5 String Bass, allowed for some really cool runs.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/redbone-bass.mp4" 
      },
    ] 
  },
];