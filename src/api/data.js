// Local film catalogue for YARPHOENIX MOVIES — used as an offline fallback
// when the OMDb API is unavailable (or no API key is configured).
// Each film carries a `tone` (0..6) that drives a black & white placeholder
// poster style, plus full metadata for the detail page.
export const FILMS = [
  {
    id: "ashfall",
    title: "Ashfall",
    year: "2024", type: "movie", runtime: "2h 11m", rating: "8.4",
    genres: ["Drama", "Thriller"], tone: 5,
    director: "M. Voss", cast: ["L. Reyne", "A. Okonkwo", "S. Park"],
    tagline: "What rises from the ruin.",
    synopsis: "A volcanologist returns to the town that buried her family, only to find the mountain stirring again — and the people who never left waiting for an answer she cannot give."
  },
  {
    id: "the-long-light",
    title: "The Long Light",
    year: "2023", type: "movie", runtime: "1h 48m", rating: "7.9",
    genres: ["Drama"], tone: 1,
    director: "I. Halvorsen", cast: ["N. Crane", "E. Vossberg"],
    tagline: "Some winters never end.",
    synopsis: "Across a single Arctic night that lasts four months, a lighthouse keeper and a stranded surveyor measure out a friendship in lamp oil and silence."
  },
  {
    id: "carrion-city",
    title: "Carrion City",
    year: "2022", type: "series", runtime: "3 seasons", rating: "8.8",
    genres: ["Crime", "Noir"], tone: 6,
    director: "R. Mbeki", cast: ["D. Salt", "V. Ng", "F. Marchetti"],
    tagline: "Every bird comes home.",
    synopsis: "A homicide detective with a perfect record works the one case that has no body, no motive, and no end — only a symbol left at every scene."
  },
  {
    id: "paper-moons",
    title: "Paper Moons",
    year: "2025", type: "movie", runtime: "1h 39m", rating: "7.2",
    genres: ["Romance", "Comedy"], tone: 0,
    director: "C. Adeyemi", cast: ["J. Lund", "T. Ferreira"],
    tagline: "A small lie, beautifully kept.",
    synopsis: "Two strangers agree to fake an engagement for one weekend. The weekend has other plans."
  },
  {
    id: "the-glasshouse",
    title: "The Glasshouse",
    year: "2021", type: "movie", runtime: "2h 02m", rating: "8.1",
    genres: ["Sci-Fi", "Drama"], tone: 3,
    director: "M. Voss", cast: ["A. Okonkwo", "P. Rhee"],
    tagline: "Everything you grow can see you.",
    synopsis: "On a botanical research station the plants begin to keep records. The crew begins to disagree about whose records matter."
  },
  {
    id: "hollow-bird",
    title: "Hollow Bird",
    year: "2020", type: "series", runtime: "2 seasons", rating: "8.0",
    genres: ["Mystery"], tone: 4,
    director: "S. Okafor", cast: ["V. Ng", "L. Reyne"],
    tagline: "Sing and they will find you.",
    synopsis: "A folk musician inherits her grandmother's house and the recordings hidden under its floorboards — songs no one alive remembers writing."
  },
  {
    id: "north-of-noon",
    title: "North of Noon",
    year: "2019", type: "movie", runtime: "1h 55m", rating: "7.6",
    genres: ["Western", "Drama"], tone: 2,
    director: "R. Mbeki", cast: ["D. Salt", "E. Vossberg"],
    tagline: "The map ends here.",
    synopsis: "A surveyor and an outlaw share the last horse across a territory that no government has bothered to name."
  },
  {
    id: "static-bloom",
    title: "Static Bloom",
    year: "2024", type: "series", runtime: "1 season", rating: "7.4",
    genres: ["Sci-Fi", "Horror"], tone: 6,
    director: "I. Halvorsen", cast: ["P. Rhee", "F. Marchetti"],
    tagline: "Tune in. Don't tune out.",
    synopsis: "A pirate radio signal starts predicting deaths in a coastal town. The DJ swears she is only reading the news."
  },
  {
    id: "the-quiet-fleet",
    title: "The Quiet Fleet",
    year: "2023", type: "movie", runtime: "2h 24m", rating: "8.6",
    genres: ["War", "Drama"], tone: 5,
    director: "M. Voss", cast: ["N. Crane", "S. Park", "T. Ferreira"],
    tagline: "Silence is an order.",
    synopsis: "A submarine crew under radio blackout must decide whether the war they were sent to fight is still being fought above them."
  },
  {
    id: "marigold-st",
    title: "Marigold Street",
    year: "2022", type: "movie", runtime: "1h 44m", rating: "7.0",
    genres: ["Drama", "Family"], tone: 1,
    director: "C. Adeyemi", cast: ["J. Lund", "A. Okonkwo"],
    tagline: "Home is a verb.",
    synopsis: "Three generations under one leaking roof learn that the house cannot be saved, and neither can the silence between them."
  },
  {
    id: "lantern-jaw",
    title: "Lantern Jaw",
    year: "2018", type: "series", runtime: "4 seasons", rating: "8.3",
    genres: ["Action", "Comedy"], tone: 0,
    director: "S. Okafor", cast: ["D. Salt", "V. Ng"],
    tagline: "A hero with terrible timing.",
    synopsis: "A washed-up stunt double accidentally becomes the city's most beloved vigilante, mostly by falling on the right people."
  },
  {
    id: "cold-harbor",
    title: "Cold Harbor",
    year: "2025", type: "movie", runtime: "2h 07m", rating: "8.2",
    genres: ["Thriller"], tone: 3,
    director: "R. Mbeki", cast: ["L. Reyne", "P. Rhee"],
    tagline: "The tide keeps its secrets.",
    synopsis: "An insurance investigator arrives at a fishing village where every claim is true, every story is rehearsed, and no one will say what sank."
  },
  {
    id: "the-understudy",
    title: "The Understudy",
    year: "2021", type: "movie", runtime: "1h 51m", rating: "7.8",
    genres: ["Drama", "Thriller"], tone: 4,
    director: "I. Halvorsen", cast: ["E. Vossberg", "T. Ferreira"],
    tagline: "Break a leg. Someone's.",
    synopsis: "When a stage legend falls ill, her understudy gets the role of a lifetime — and discovers the part comes with a body count."
  },
  {
    id: "feather-iron",
    title: "Feather & Iron",
    year: "2020", type: "movie", runtime: "2h 18m", rating: "8.5",
    genres: ["Fantasy", "Adventure"], tone: 2,
    director: "M. Voss", cast: ["A. Okonkwo", "N. Crane"],
    tagline: "Rise. Then rise again.",
    synopsis: "A blacksmith forges wings for a dying empire and learns too late that flight was never the point."
  },
  {
    id: "midnight-index",
    title: "Midnight Index",
    year: "2024", type: "series", runtime: "2 seasons", rating: "7.7",
    genres: ["Crime", "Drama"], tone: 6,
    director: "S. Okafor", cast: ["F. Marchetti", "S. Park"],
    tagline: "Every name has a price.",
    synopsis: "A night-shift librarian catalogues the city's missing persons in a ledger no one asked her to keep — until someone wants it back."
  },
  {
    id: "saltwater-room",
    title: "The Saltwater Room",
    year: "2019", type: "movie", runtime: "1h 36m", rating: "7.1",
    genres: ["Romance", "Drama"], tone: 1,
    director: "C. Adeyemi", cast: ["J. Lund", "L. Reyne"],
    tagline: "Hold your breath.",
    synopsis: "Two divers fall in love a hundred feet down, where neither can speak and both must trust the other's hands."
  },
  {
    id: "the-arsonists",
    title: "The Arsonists",
    year: "2023", type: "series", runtime: "1 season", rating: "8.1",
    genres: ["Drama", "Thriller"], tone: 5,
    director: "R. Mbeki", cast: ["D. Salt", "E. Vossberg", "V. Ng"],
    tagline: "Some fires are written down.",
    synopsis: "A firefighter and the investigator hunting a serial arsonist realise they have been reading the same diary — from opposite ends."
  },
  {
    id: "pale-engine",
    title: "Pale Engine",
    year: "2022", type: "movie", runtime: "2h 09m", rating: "8.0",
    genres: ["Sci-Fi"], tone: 3,
    director: "I. Halvorsen", cast: ["P. Rhee", "T. Ferreira"],
    tagline: "The last machine remembers.",
    synopsis: "Long after the factories fell quiet, one engine keeps running on a fuel no one can name, in a city that forgot it was ever switched on."
  },
  {
    id: "paper-crane-academy",
    title: "Paper Crane Academy",
    year: "2021", type: "series", runtime: "2 seasons", rating: "8.3",
    genres: ["Animation", "Fantasy", "Coming-of-Age"], tone: 4,
    director: "K. Amano", cast: ["R. Sato", "M. Inoue", "H. Tachibana"],
    tagline: "Fold your fear into something that can fly.",
    synopsis: "At a school built on the back of a sleeping crane god, a transfer student learns that every fold in the paper charms taught here costs the folder a memory."
  },
  {
    id: "the-last-cicada",
    title: "The Last Cicada",
    year: "2023", type: "movie", runtime: "1h 47m", rating: "8.7",
    genres: ["Animation", "Drama"], tone: 2,
    director: "K. Amano", cast: ["H. Tachibana", "R. Sato"],
    tagline: "One more summer, drawn by hand.",
    synopsis: "A dying animator spends his last summer hand-painting the town he grew up in, frame by frame, so that someone else can remember it after he can't."
  }
];
