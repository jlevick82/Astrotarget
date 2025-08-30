const messierCatalog = [
  {
    id: "M1",
    name: "Crab Nebula",
    type: "Supernova Remnant",
    mag: 8.4,
    size: "6′ × 4′",
    ra: "05h 34m 31s",
    dec: "+22° 00′ 52″",
    image: "images/full/m1.jpg"
  },
  {
    id: "M2",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 6.3,
    size: "16′",
    ra: "21h 33m 27s",
    dec: "−00° 49′ 24″",
    image: "images/full/m2.jpg"
  },
  {
    id: "M3",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 6.2,
    size: "18′",
    ra: "13h 42m 11s",
    dec: "+28° 22′ 32″",
    image: "images/full/m3.jpg"
  },
  {
    id: "M4",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 5.9,
    size: "26′",
    ra: "16h 23m 35s",
    dec: "−26° 31′ 32″",
    image: "images/full/m4.jpg"
  },
  {
    id: "M5",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 5.7,
    size: "17′",
    ra: "15h 18m 33s",
    dec: "+02° 04′ 57″",
    image: "images/full/m5.jpg"
  },
  {
    id: "M6",
    name: "Butterfly Cluster",
    type: "Open Cluster",
    mag: 4.2,
    size: "25′",
    ra: "17h 40m 20s",
    dec: "−32° 15′ 12″",
    image: "images/full/m6.jpg"
  },
  {
    id: "M7",
    name: "Ptolemy’s Cluster",
    type: "Open Cluster",
    mag: 3.3,
    size: "80′",
    ra: "17h 53m 51s",
    dec: "−34° 47′ 36″",
    image: "images/full/m7.jpg"
  },
  {
    id: "M8",
    name: "Lagoon Nebula",
    type: "Diffuse Nebula",
    mag: 6.0,
    size: "90′ × 40′",
    ra: "18h 03m 41s",
    dec: "−24° 23′ 12″",
    image: "images/full/m8.jpg"
  },
  {
    id: "M9",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.9,
    size: "9′",
    ra: "17h 19m 12s",
    dec: "−18° 30′ 58″",
    image: "images/full/m9.jpg"
  },
  {
    id: "M10",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 6.6,
    size: "15′",
    ra: "16h 57m 09s",
    dec: "−04° 06′ 01″",
    image: "images/full/m10.jpg"
  },
  {
    id: "M11",
    name: "Wild Duck Cluster",
    type: "Open Cluster",
    mag: 5.8,
    size: "14′",
    ra: "18h 51m 05s",
    dec: "−06° 16′ 12″",
    image: "images/full/m11.jpg"
  },
  {
    id: "M12",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 6.6,
    size: "14′",
    ra: "16h 47m 14s",
    dec: "−01° 56′ 54″",
    image: "images/full/m12.jpg"
  },
  {
    id: "M13",
    name: "Great Hercules Cluster",
    type: "Globular Cluster",
    mag: 5.8,
    size: "20′",
    ra: "16h 41m 41s",
    dec: "+36° 27′ 37″",
    image: "images/full/m13.jpg"
  },
  {
    id: "M14",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.6,
    size: "11′",
    ra: "17h 37m 36s",
    dec: "−03° 14′ 45″",
    image: "images/full/m14.jpg"
  },
  {
    id: "M15",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 6.2,
    size: "12′",
    ra: "21h 30m 00s",
    dec: "+12° 10′ 00″",
    image: "images/full/m15.jpg"
  },
  {
    id: "M16",
    name: "Eagle Nebula",
    type: "Diffuse Nebula + Open Cluster",
    mag: 6.4,
    size: "35′",
    ra: "18h 18m 48s",
    dec: "−13° 48′ 24″",
    image: "images/full/m16.jpg"
  },
  {
    id: "M17",
    name: "Omega Nebula",
    type: "Diffuse Nebula",
    mag: 6.0,
    size: "20′ × 15′",
    ra: "18h 20m 47s",
    dec: "−16° 10′ 18″",
    image: "images/full/m17.jpg"
  },
  {
    id: "M18",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 7.5,
    size: "9′",
    ra: "18h 19m 58s",
    dec: "−17° 06′ 06″",
    image: "images/full/m18.jpg"
  },
  {
    id: "M19",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 6.8,
    size: "13′",
    ra: "17h 02m 37s",
    dec: "−26° 16′ 05″",
    image: "images/full/m19.jpg"
  },
  {
    id: "M20",
    name: "Trifid Nebula",
    type: "Diffuse Nebula + Open Cluster",
    mag: 6.3,
    size: "28′",
    ra: "18h 02m 23s",
    dec: "−23° 01′ 48″",
    image: "images/full/m20.jpg"
  },
  {
    id: "M21",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 6.5,
    size: "13′",
    ra: "18h 04m 13s",
    dec: "−22° 29′ 24″",
    image: "images/full/m21.jpg"
  },
  {
    id: "M22",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 5.1,
    size: "32′",
    ra: "18h 36m 24s",
    dec: "−23° 54′ 12″",
    image: "images/full/m22.jpg"
  },
  {
    id: "M23",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 6.9,
    size: "27′",
    ra: "17h 57m 05s",
    dec: "−19° 01′ 48″",
    image: "images/full/m23.jpg"
  },
  {
    id: "M24",
    name: "Sagittarius Star Cloud",
    type: "Star Cloud",
    mag: 4.6,
    size: "90′ × 40′",
    ra: "18h 16m 48s",
    dec: "−18° 29′ 00″",
    image: "images/full/m24.jpg"
  },
  {
    id: "M25",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 4.6,
    size: "32′",
    ra: "18h 31m 46s",
    dec: "−19° 15′ 24″",
    image: "images/full/m25.jpg"
  },
  {
    id: "M26",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 8.0,
    size: "7′",
    ra: "18h 45m 18s",
    dec: "−09° 24′ 00″",
    image: "images/full/m26.jpg"
  },
  {
    id: "M27",
    name: "Dumbbell Nebula",
    type: "Planetary Nebula",
    mag: 7.4,
    size: "8′",
    ra: "19h 59m 36s",
    dec: "+22° 43′ 16″",
    image: "images/full/m27.jpg"
  },
  {
    id: "M28",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 6.9,
    size: "11′",
    ra: "18h 24m 33s",
    dec: "−24° 52′ 12″",
    image: "images/full/m28.jpg"
  },
  {
    id: "M29",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 7.1,
    size: "7′",
    ra: "20h 23m 57s",
    dec: "+38° 30′ 30″",
    image: "images/full/m29.jpg"
  },
  {
    id: "M30",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.2,
    size: "12′",
    ra: "21h 40m 22s",
    dec: "−23° 10′ 44″",
    image: "images/full/m30.jpg"
  },
  {
    id: "M31",
    name: "Andromeda Galaxy",
    type: "Galaxy",
    mag: 3.4,
    size: "190′ × 60′",
    ra: "00h 42m 44s",
    dec: "+41° 16′ 09″",
    image: "images/full/m31.jpg"
  },
  {
    id: "M32",
    name: "Satellite of M31",
    type: "Galaxy",
    mag: 8.1,
    size: "8′ × 6′",
    ra: "00h 42m 41s",
    dec: "+40° 51′ 58″",
    image: "images/full/m32.jpg"
  },
  {
    id: "M33",
    name: "Triangulum Galaxy",
    type: "Galaxy",
    mag: 5.7,
    size: "70′ × 41′",
    ra: "01h 33m 50s",
    dec: "+30° 39′ 37″",
    image: "images/full/m33.jpg"
  },
  {
    id: "M34",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 5.5,
    size: "35′",
    ra: "02h 42m 06s",
    dec: "+42° 45′ 42″",
    image: "images/full/m34.jpg"
  },
  {
    id: "M35",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 5.3,
    size: "28′",
    ra: "06h 08m 54s",
    dec: "+24° 20′ 00″",
    image: "images/full/m35.jpg"
  },
  {
    id: "M36",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 6.3,
    size: "12′",
    ra: "05h 36m 12s",
    dec: "+34° 08′ 24″",
    image: "images/full/m36.jpg"
  },
  {
    id: "M37",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 5.6,
    size: "24′",
    ra: "05h 52m 18s",
    dec: "+32° 33′ 12″",
    image: "images/full/m37.jpg"
  },
  {
    id: "M38",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 7.4,
    size: "20′",
    ra: "05h 28m 42s",
    dec: "+35° 50′ 54″",
    image: "images/full/m38.jpg"
  },
  {
    id: "M39",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 4.6,
    size: "32′",
    ra: "21h 31m 48s",
    dec: "+48° 26′ 00″",
    image: "images/full/m39.jpg"
  },
  {
    id: "M40",
    name: "Winnecke 4 (Double Star)",
    type: "Double Star",
    mag: 9.0,
    size: "49″",
    ra: "12h 22m 12s",
    dec: "+58° 05′ 00″",
    image: "images/full/m40.jpg"
  },
// Continuing messierCatalog array...

  {
    id: "M41",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 4.5,
    size: "38′",
    ra: "06h 46m 00s",
    dec: "−20° 45′ 00″",
    image: "images/full/m41.jpg"
  },
  {
    id: "M42",
    name: "Orion Nebula",
    type: "Diffuse Nebula",
    mag: 4.0,
    size: "65′ × 60′",
    ra: "05h 35m 17s",
    dec: "−05° 23′ 28″",
    image: "images/full/m42.jpg"
  },
  {
    id: "M43",
    name: "De Mairan’s Nebula",
    type: "Diffuse Nebula",
    mag: 9.0,
    size: "20′ × 15′",
    ra: "05h 35m 31s",
    dec: "−05° 16′ 12″",
    image: "images/full/m43.jpg"
  },
  {
    id: "M44",
    name: "Beehive Cluster",
    type: "Open Cluster",
    mag: 3.1,
    size: "95′",
    ra: "08h 40m 24s",
    dec: "+19° 40′ 00″",
    image: "images/full/m44.jpg"
  },
  {
    id: "M45",
    name: "Pleiades",
    type: "Open Cluster",
    mag: 1.6,
    size: "110′",
    ra: "03h 47m 24s",
    dec: "+24° 07′ 00″",
    image: "images/full/m45.jpg"
  },
  {
    id: "M46",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 6.1,
    size: "27′",
    ra: "07h 41m 46s",
    dec: "−14° 49′ 00″",
    image: "images/full/m46.jpg"
  },
  {
    id: "M47",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 4.4,
    size: "30′",
    ra: "07h 36m 36s",
    dec: "−14° 30′ 00″",
    image: "images/full/m47.jpg"
  },
  {
    id: "M48",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 5.8,
    size: "54′",
    ra: "08h 13m 43s",
    dec: "−05° 45′ 00″",
    image: "images/full/m48.jpg"
  },
  {
    id: "M49",
    name: "Virgo A Galaxy",
    type: "Galaxy",
    mag: 8.4,
    size: "9′ × 8′",
    ra: "12h 29m 46s",
    dec: "+08° 00′ 02″",
    image: "images/full/m49.jpg"
  },
  {
    id: "M50",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 5.9,
    size: "16′",
    ra: "07h 03m 00s",
    dec: "−08° 20′ 00″",
    image: "images/full/m50.jpg"
  },
  {
    id: "M51",
    name: "Whirlpool Galaxy",
    type: "Galaxy",
    mag: 8.4,
    size: "11′ × 7′",
    ra: "13h 29m 52s",
    dec: "+47° 11′ 43″",
    image: "images/full/m51.jpg"
  },
  {
    id: "M52",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 7.3,
    size: "13′",
    ra: "23h 24m 48s",
    dec: "+61° 35′ 36″",
    image: "images/full/m52.jpg"
  },
  {
    id: "M53",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.6,
    size: "13′",
    ra: "13h 12m 55s",
    dec: "+18° 10′ 05″",
    image: "images/full/m53.jpg"
  },
  {
    id: "M54",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.6,
    size: "12′",
    ra: "18h 55m 03s",
    dec: "−30° 28′ 48″",
    image: "images/full/m54.jpg"
  },
  {
    id: "M55",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.0,
    size: "19′",
    ra: "19h 40m 00s",
    dec: "−30° 57′ 44″",
    image: "images/full/m55.jpg"
  },
  {
    id: "M56",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 8.3,
    size: "7′",
    ra: "19h 16m 36s",
    dec: "+30° 11′ 00″",
    image: "images/full/m56.jpg"
  },
  {
    id: "M57",
    name: "Ring Nebula",
    type: "Planetary Nebula",
    mag: 8.8,
    size: "1.4′",
    ra: "18h 53m 35s",
    dec: "+33° 01′ 45″",
    image: "images/full/m57.jpg"
  },
  {
    id: "M58",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.7,
    size: "5′ × 4′",
    ra: "12h 37m 43s",
    dec: "+11° 49′ 00″",
    image: "images/full/m58.jpg"
  },
  {
    id: "M59",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.6,
    size: "5′ × 3′",
    ra: "12h 42m 02s",
    dec: "+11° 39′ 00″",
    image: "images/full/m59.jpg"
  },
  {
    id: "M60",
    name: "Galaxy",
    type: "Galaxy",
    mag: 8.8,
    size: "7′ × 6′",
    ra: "12h 43m 40s",
    dec: "+11° 33′ 10″",
    image: "images/full/m60.jpg"
  },
  {
    id: "M61",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.7,
    size: "6′ × 5′",
    ra: "12h 21m 55s",
    dec: "+04° 28′ 25″",
    image: "images/full/m61.jpg"
  },
  {
    id: "M62",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 6.4,
    size: "14′",
    ra: "17h 01m 13s",
    dec: "−30° 06′ 44″",
    image: "images/full/m62.jpg"
  },
  {
    id: "M63",
    name: "Sunflower Galaxy",
    type: "Galaxy",
    mag: 9.3,
    size: "13′ × 7′",
    ra: "13h 15m 49s",
    dec: "+42° 01′ 45″",
    image: "images/full/m63.jpg"
  },
  {
    id: "M64",
    name: "Black Eye Galaxy",
    type: "Galaxy",
    mag: 8.5,
    size: "10′ × 5′",
    ra: "12h 56m 43s",
    dec: "+21° 41′ 00″",
    image: "images/full/m64.jpg"
  },
  {
    id: "M65",
    name: "Galaxy (Leo Triplet)",
    type: "Galaxy",
    mag: 9.3,
    size: "8′ × 2′",
    ra: "11h 18m 56s",
    dec: "+13° 05′ 32″",
    image: "images/full/m65.jpg"
  },
  {
    id: "M66",
    name: "Galaxy (Leo Triplet)",
    type: "Galaxy",
    mag: 8.9,
    size: "9′ × 4′",
    ra: "11h 20m 15s",
    dec: "+12° 59′ 29″",
    image: "images/full/m66.jpg"
  },
  {
    id: "M67",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 6.9,
    size: "30′",
    ra: "08h 51m 18s",
    dec: "+11° 48′ 00″",
    image: "images/full/m67.jpg"
  },
  {
    id: "M68",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.8,
    size: "12′",
    ra: "12h 39m 28s",
    dec: "−26° 45′ 00″",
    image: "images/full/m68.jpg"
  },
  {
    id: "M69",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.7,
    size: "7′",
    ra: "18h 31m 23s",
    dec: "−32° 20′ 57″",
    image: "images/full/m69.jpg"
  },
  {
    id: "M70",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.9,
    size: "7′",
    ra: "18h 43m 12s",
    dec: "−32° 17′ 31″",
    image: "images/full/m70.jpg"
  },
  {
    id: "M71",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 8.2,
    size: "7′",
    ra: "19h 53m 46s",
    dec: "+18° 47′ 00″",
    image: "images/full/m71.jpg"
  },
  {
    id: "M72",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 9.3,
    size: "6′",
    ra: "20h 53m 27s",
    dec: "−12° 32′ 00″",
    image: "images/full/m72.jpg"
  },
  {
    id: "M73",
    name: "Asterism (4 stars)",
    type: "Asterism",
    mag: 9.0,
    size: "3′",
    ra: "20h 58m 56s",
    dec: "−12° 38′ 00″",
    image: "images/full/m73.jpg"
  },
  {
    id: "M74",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.4,
    size: "10′ × 9′",
    ra: "01h 36m 41s",
    dec: "+15° 47′ 00″",
    image: "images/full/m74.jpg"
  },
  {
    id: "M75",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 8.6,
    size: "6′",
    ra: "20h 06m 05s",
    dec: "−21° 55′ 00″",
    image: "images/full/m75.jpg"
  },
  {
    id: "M76",
    name: "Little Dumbbell Nebula",
    type: "Planetary Nebula",
    mag: 10.1,
    size: "2.7′ × 1.8′",
    ra: "01h 42m 18s",
    dec: "+51° 34′ 00″",
    image: "images/full/m76.jpg"
  },
  {
    id: "M77",
    name: "Galaxy",
    type: "Galaxy",
    mag: 8.9,
    size: "7′ × 6′",
    ra: "02h 42m 41s",
    dec: "−00° 00′ 48″",
    image: "images/full/m77.jpg"
  },
  {
    id: "M78",
    name: "Diffuse Nebula",
    type: "Diffuse Nebula",
    mag: 8.3,
    size: "8′ × 6′",
    ra: "05h 46m 46s",
    dec: "+00° 03′ 00″",
    image: "images/full/m78.jpg"
  },
  {
    id: "M79",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.7,
    size: "9′",
    ra: "05h 24m 11s",
    dec: "−24° 31′ 30″",
    image: "images/full/m79.jpg"
  },
  {
    id: "M80",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.7,
    size: "10′",
    ra: "16h 17m 02s",
    dec: "−22° 58′ 30″",
    image: "images/full/m80.jpg"
  },
  {
    id: "M81",
    name: "Bode’s Galaxy",
    type: "Galaxy",
    mag: 6.9,
    size: "27′ × 14′",
    ra: "09h 55m 33s",
    dec: "+69° 03′ 55″",
    image: "images/full/m81.jpg"
  },
  {
    id: "M82",
    name: "Cigar Galaxy",
    type: "Galaxy",
    mag: 8.4,
    size: "11′ × 5′",
    ra: "09h 55m 52s",
    dec: "+69° 40′ 47″",
    image: "images/full/m82.jpg"
  },
  {
    id: "M83",
    name: "Southern Pinwheel Galaxy",
    type: "Galaxy",
    mag: 7.6,
    size: "12′ × 11′",
    ra: "13h 37m 00s",
    dec: "−29° 52′ 04″",
    image: "images/full/m83.jpg"
  },
  {
    id: "M84",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.1,
    size: "5′ × 4′",
    ra: "12h 25m 03s",
    dec: "+12° 53′ 13″",
    image: "images/full/m84.jpg"
  },
  {
    id: "M85",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.1,
    size: "7′ × 5′",
    ra: "12h 25m 24s",
    dec: "+18° 11′ 26″",
    image: "images/full/m85.jpg"
  },
  {
    id: "M86",
    name: "Galaxy",
    type: "Galaxy",
    mag: 8.9,
    size: "8′ × 5′",
    ra: "12h 26m 12s",
    dec: "+12° 56′ 45″",
    image: "images/full/m86.jpg"
  },
  {
    id: "M87",
    name: "Virgo A Galaxy",
    type: "Galaxy",
    mag: 8.6,
    size: "7′ × 6′",
    ra: "12h 30m 49s",
    dec: "+12° 23′ 28″",
    image: "images/full/m87.jpg"
  },
  {
    id: "M88",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.6,
    size: "7′ × 4′",
    ra: "12h 31m 59s",
    dec: "+14° 25′ 13″",
    image: "images/full/m88.jpg"
  },
  {
    id: "M89",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.8,
    size: "5′ × 4′",
    ra: "12h 35m 39s",
    dec: "+12° 33′ 23″",
    image: "images/full/m89.jpg"
  },
  {
    id: "M90",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.5,
    size: "9′ × 4′",
    ra: "12h 36m 50s",
    dec: "+13° 09′ 46″",
    image: "images/full/m90.jpg"
  },
  {
    id: "M91",
    name: "Galaxy",
    type: "Galaxy",
    mag: 10.2,
    size: "5′ × 4′",
    ra: "12h 35m 27s",
    dec: "+14° 29′ 47″",
    image: "images/full/m91.jpg"
  },
  {
    id: "M92",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 6.5,
    size: "14′",
    ra: "17h 17m 07s",
    dec: "+43° 08′ 12″",
    image: "images/full/m92.jpg"
  },
  {
    id: "M93",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 6.0,
    size: "22′",
    ra: "07h 44m 30s",
    dec: "−23° 51′ 00″",
    image: "images/full/m93.jpg"
  },
  {
    id: "M94",
    name: "Galaxy",
    type: "Galaxy",
    mag: 8.2,
    size: "7′ × 3′",
    ra: "12h 50m 53s",
    dec: "+41° 07′ 12″",
    image: "images/full/m94.jpg"
  },
  {
    id: "M95",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.7,
    size: "4′ × 3′",
    ra: "10h 43m 57s",
    dec: "+11° 42′ 14″",
    image: "images/full/m95.jpg"
  },
  {
    id: "M96",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.2,
    size: "6′ × 4′",
    ra: "10h 46m 46s",
    dec: "+11° 49′ 02″",
    image: "images/full/m96.jpg"
  },
  {
    id: "M97",
    name: "Owl Nebula",
    type: "Planetary Nebula",
    mag: 9.9,
    size: "3.4′",
    ra: "11h 14m 48s",
    dec: "+55° 01′ 09″",
    image: "images/full/m97.jpg"
  },
  {
    id: "M98",
    name: "Galaxy",
    type: "Galaxy",
    mag: 10.1,
    size: "9′ × 3′",
    ra: "12h 13m 48s",
    dec: "+14° 54′ 01″",
    image: "images/full/m98.jpg"
  },
  {
    id: "M99",
    name: "Coma Pinwheel Galaxy",
    type: "Galaxy",
    mag: 9.9,
    size: "5′ × 4′",
    ra: "12h 18m 50s",
    dec: "+14° 25′ 19″",
    image: "images/full/m99.jpg"
  },
  {
    id: "M100",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.4,
    size: "7′ × 6′",
    ra: "12h 22m 55s",
    dec: "+15° 49′ 21″",
    image: "images/full/m100.jpg"
  },
  {
    id: "M101",
    name: "Pinwheel Galaxy",
    type: "Galaxy",
    mag: 7.9,
    size: "28′ × 26′",
    ra: "14h 03m 12s",
    dec: "+54° 20′ 57″",
    image: "images/full/m101.jpg"
  },
  {
    id: "M102",
    name: "Spindle Galaxy (NGC 5866)",
    type: "Galaxy",
    mag: 9.9,
    size: "5′ × 2′",
    ra: "15h 06m 29s",
    dec: "+55° 45′ 48″",
    image: "images/full/m102.jpg"
  },
  {
    id: "M103",
    name: "Open Cluster",
    type: "Open Cluster",
    mag: 7.4,
    size: "6′",
    ra: "01h 33m 23s",
    dec: "+60° 42′ 00″",
    image: "images/full/m103.jpg"
  },
  {
    id: "M104",
    name: "Sombrero Galaxy",
    type: "Galaxy",
    mag: 8.0,
    size: "9′ × 4′",
    ra: "12h 39m 59s",
    dec: "−11° 37′ 23″",
    image: "images/full/m104.jpg"
  },
  {
    id: "M105",
    name: "Galaxy",
    type: "Galaxy",
    mag: 9.3,
    size: "5′ × 4′",
    ra: "10h 47m 49s",
    dec: "+12° 34′ 53″",
    image: "images/full/m105.jpg"
  },
  {
    id: "M106",
    name: "Galaxy",
    type: "Galaxy",
    mag: 8.4,
    size: "19′ × 8′",
    ra: "12h 18m 57s",
    dec: "+47° 18′ 14″",
    image: "images/full/m106.jpg"
  },
  {
    id: "M107",
    name: "Globular Cluster",
    type: "Globular Cluster",
    mag: 7.9,
    size: "10′",
    ra: "16h 32m 32s",
    dec: "−13° 03′ 00″",
    image: "images/full/m107.jpg"
  },
  {
    id: "M108",
    name: "Galaxy",
    type: "Galaxy",
    mag: 10.0,
    size: "8′ × 2′",
    ra: "11h 11m 31s",
    dec: "+55° 40′ 31″",
    image: "images/full/m108.jpg"
  },
  {
    id: "M109",
    name: "Galaxy",
    type: "Galaxy",
    mag: 10.6,
    size: "7′ × 4′",
    ra: "11h 57m 36s",
    dec: "+53° 23′ 14″",
    image: "images/full/m109.jpg"
  },
  {
    id: "M110",
    name: "Satellite of M31",
    type: "Galaxy",
    mag: 8.5,
    size: "17′ × 10′",
    ra: "00h 40m 22s",
    dec: "+41° 41′ 07″",
    image: "images/full/m110.jpg"
  }
];
