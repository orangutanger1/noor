import { RamadanDua } from '@/types/ramadan';

// Ramadan day-number facts are the same every year; only the Gregorian start moves.
export const RAMADAN_TOTAL_DAYS = 30;
export const LAST_TEN_START = 21;
export const LAYLATUL_QADR_NIGHTS = [21, 23, 25, 27, 29];

// ── Hijri → Gregorian (tabular Islamic calendar) ──
// ponytail: pure arithmetic, no Hijri lib — Hermes Intl lacks calendar conversion.
// Verified against Umm al-Qura: Ramadan 1446→2025-03-01, 1447→2026-02-18, 1448→2027-02-08.
// Arithmetic dates can differ ±1 day from a region's moon-sighting announcement;
// nudge with RAMADAN_DAY_OFFSET (days) if your locale declares Ramadan on a different day.
const RAMADAN_DAY_OFFSET = 0;
const ISLAMIC_EPOCH = 1948439.5;
const MS_PER_DAY = 86400000;

function islamicToJD(year: number, month: number, day: number): number {
  return day
    + Math.ceil(29.5 * (month - 1))
    + (year - 1) * 354
    + Math.floor((3 + 11 * year) / 30)
    + ISLAMIC_EPOCH - 1;
}

// Julian Day → Gregorian Date at local midnight (Fliegel–Van Flandern).
function jdToDate(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return new Date(year, month - 1, day);
}

export interface RamadanPeriod {
  hijriYear: number;
  start: Date; // local midnight of Ramadan day 1
  end: Date; // local end-of-day of the last day
  totalDays: number;
}

function ramadanForHijriYear(hijriYear: number): RamadanPeriod {
  const start = jdToDate(islamicToJD(hijriYear, 9, 1));
  start.setDate(start.getDate() + RAMADAN_DAY_OFFSET);
  const end = new Date(start);
  end.setDate(end.getDate() + RAMADAN_TOTAL_DAYS - 1);
  end.setHours(23, 59, 59, 999);
  return { hijriYear, start, end, totalDays: RAMADAN_TOTAL_DAYS };
}

const atMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * The Ramadan that is currently active, or — if none is — the next upcoming one.
 * Works for any year; the 4-year scan window always brackets the right Ramadan.
 */
export function getRamadanPeriod(date: Date = new Date()): RamadanPeriod {
  const approx = Math.floor(((date.getFullYear() - 622) * 33) / 32) + 1;
  let next: RamadanPeriod | null = null;
  // Window must bracket the relevant Hijri year. `approx` can be off by ~2 (and a year
  // can hold two Ramadans — e.g. 2030 has one in Jan and one in Dec), so scan ±2.
  for (let hy = approx - 2; hy <= approx + 2; hy++) {
    const p = ramadanForHijriYear(hy);
    if (date >= p.start && date <= p.end) return p; // active now
    if (p.start > date && (!next || p.start < next.start)) next = p; // soonest future
  }
  return next ?? ramadanForHijriYear(approx + 1);
}

/** Config for the active-or-next Ramadan, mirroring the old RAMADAN_CONFIG shape. */
export function getRamadanConfig(date: Date = new Date()) {
  const p = getRamadanPeriod(date);
  return {
    year: p.hijriYear,
    startDate: p.start,
    endDate: p.end,
    totalDays: p.totalDays,
    lastTenStart: LAST_TEN_START,
    laylatulQadrNights: LAYLATUL_QADR_NIGHTS,
  };
}

/**
 * Get the Ramadan day number for a given date (or today).
 * Returns 0 if the date is not during Ramadan.
 */
export function getRamadanDayNumber(date: Date = new Date()): number {
  const p = getRamadanPeriod(date);
  if (date < p.start || date > p.end) return 0;
  const diffDays = Math.floor((atMidnight(date).getTime() - atMidnight(p.start).getTime()) / MS_PER_DAY);
  return diffDays + 1;
}

/** Whether we're within ~30 days before or during Ramadan (show promotional content). */
export function isRamadanSeason(date: Date = new Date()): boolean {
  const p = getRamadanPeriod(date);
  const seasonStart = new Date(p.start);
  seasonStart.setDate(seasonStart.getDate() - 30);
  return date >= seasonStart && date <= p.end;
}

/** Whether the given date falls within Ramadan. */
export function isRamadanActive(date: Date = new Date()): boolean {
  return getRamadanDayNumber(date) > 0;
}

/** Gregorian date for a given Ramadan day number (of the active-or-next Ramadan). */
export function getDateForDay(dayNumber: number, date: Date = new Date()): Date {
  const result = new Date(getRamadanPeriod(date).start);
  result.setDate(result.getDate() + dayNumber - 1);
  return result;
}

/** Whether the given day number is in the last 10 nights. */
export function isLastTenNights(dayNumber: number): boolean {
  return dayNumber >= LAST_TEN_START;
}

/** Whether the given day number is a potential Laylatul Qadr night. */
export function isLaylatulQadr(dayNumber: number): boolean {
  return LAYLATUL_QADR_NIGHTS.includes(dayNumber);
}

/** Whole days until Ramadan starts. Returns 0 once it has started. */
export function daysUntilRamadan(date: Date = new Date()): number {
  const start = atMidnight(getRamadanPeriod(date).start);
  return Math.max(0, Math.ceil((start.getTime() - atMidnight(date).getTime()) / MS_PER_DAY));
}

export const ramadanDuas: RamadanDua[] = [
  {
    id: 1,
    dayNumber: 1,
    arabic: 'اللَّهُمَّ اجْعَلْ صِيَامِي فِيهِ صِيَامَ الصَّائِمِينَ وَقِيَامِي فِيهِ قِيَامَ الْقَائِمِينَ',
    translation: 'O Allah, make my fasting in it the fasting of those who truly fast, and my standing in prayer the standing of those who truly pray.',
    transliteration: "Allahumma aj'al siyami fihi siyamas-sa'imin wa qiyami fihi qiyamal-qa'imin",
    theme: 'Sincerity',
  },
  {
    id: 2,
    dayNumber: 2,
    arabic: 'اللَّهُمَّ قَرِّبْنِي فِيهِ إِلَى مَرْضَاتِكَ وَجَنِّبْنِي فِيهِ مِنْ سَخَطِكَ وَنَقِمَاتِكَ',
    translation: 'O Allah, bring me closer to Your pleasure and keep me away from Your wrath and punishment.',
    transliteration: "Allahumma qarribni fihi ila mardatik wa jannibni fihi min sakhatik wa naqimatik",
    theme: 'Closeness to Allah',
  },
  {
    id: 3,
    dayNumber: 3,
    arabic: 'اللَّهُمَّ ارْزُقْنِي فِيهِ الذِّهْنَ وَالتَّنْبِيهَ وَبَاعِدْنِي فِيهِ مِنَ السَّفَاهَةِ وَالتَّمْوِيهِ',
    translation: 'O Allah, grant me awareness and alertness, and distance me from foolishness and deception.',
    transliteration: "Allahumma arzuqni fihidh-dhihna wat-tanbih wa ba'idni fihi minas-safahati wat-tamwih",
    theme: 'Wisdom',
  },
  {
    id: 4,
    dayNumber: 4,
    arabic: 'اللَّهُمَّ قَوِّنِي فِيهِ عَلَى إِقَامَةِ أَمْرِكَ وَأَذِقْنِي فِيهِ حَلاَوَةَ ذِكْرِكَ',
    translation: 'O Allah, strengthen me in it to establish Your commands and let me taste the sweetness of Your remembrance.',
    transliteration: "Allahumma qawwini fihi 'ala iqamati amrik wa adhiqni fihi halawata dhikrik",
    theme: 'Strength',
  },
  {
    id: 5,
    dayNumber: 5,
    arabic: 'اللَّهُمَّ اجْعَلْنِي فِيهِ مِنَ الْمُسْتَغْفِرِينَ وَاجْعَلْنِي فِيهِ مِنْ عِبَادِكَ الصَّالِحِينَ',
    translation: 'O Allah, make me among those who seek forgiveness and make me among Your righteous servants.',
    transliteration: "Allahumma aj'alni fihil-mustaghfirin waj'alni fihi min 'ibadikas-salihin",
    theme: 'Forgiveness',
  },
  {
    id: 6,
    dayNumber: 6,
    arabic: 'اللَّهُمَّ لاَ تَخْذُلْنِي فِيهِ لِتَعَرُّضِ مَعْصِيَتِكَ وَلاَ تَضْرِبْنِي بِسِيَاطِ نَقِمَتِكَ',
    translation: 'O Allah, do not forsake me in it for committing disobedience to You and do not strike me with the whips of Your punishment.',
    transliteration: "Allahumma la takhdhulni fihi lita'arrudi ma'siyatik wa la tadribni bisiyati naqimatik",
    theme: 'Protection',
  },
  {
    id: 7,
    dayNumber: 7,
    arabic: 'اللَّهُمَّ أَعِنِّي فِيهِ عَلَى صِيَامِهِ وَقِيَامِهِ وَجَنِّبْنِي فِيهِ مِنْ هَفَوَاتِهِ وَآثَامِهِ',
    translation: 'O Allah, help me in it to fast and pray, and keep me from mistakes and sins.',
    transliteration: "Allahumma a'inni fihi 'ala siyamihi wa qiyamihi wa jannibni fihi min hafawatihi wa athamih",
    theme: 'Guidance',
  },
  {
    id: 8,
    dayNumber: 8,
    arabic: 'اللَّهُمَّ ارْزُقْنِي فِيهِ رَحْمَةَ الأَيْتَامِ وَإِطْعَامَ الطَّعَامِ وَإِفْشَاءَ السَّلاَمِ',
    translation: 'O Allah, grant me in it mercy for orphans, feeding of the hungry, and spreading of peace.',
    transliteration: "Allahumma arzuqni fihi rahmatal-aytam wa it'amat-ta'am wa ifsha'as-salam",
    theme: 'Compassion',
  },
  {
    id: 9,
    dayNumber: 9,
    arabic: 'اللَّهُمَّ اجْعَلْ لِي فِيهِ نَصِيبًا مِنْ رَحْمَتِكَ الْوَاسِعَةِ وَاهْدِنِي فِيهِ بِبَرَاهِينِكَ السَّاطِعَةِ',
    translation: 'O Allah, give me a share of Your vast mercy and guide me with Your shining proofs.',
    transliteration: "Allahumma aj'al li fihi nasiban min rahmatik al-wasi'a wahdini fihi bibarahinik as-sati'a",
    theme: 'Mercy',
  },
  {
    id: 10,
    dayNumber: 10,
    arabic: 'اللَّهُمَّ اجْعَلْنِي فِيهِ مِنَ الْمُتَوَكِّلِينَ عَلَيْكَ وَاجْعَلْنِي فِيهِ مِنَ الْفَائِزِينَ عِنْدَكَ',
    translation: 'O Allah, make me among those who rely upon You and make me among the successful in Your sight.',
    transliteration: "Allahumma aj'alni fihil-mutawakkilin 'alayk waj'alni fihil-fa'izin 'indak",
    theme: 'Trust in Allah',
  },
  {
    id: 11,
    dayNumber: 11,
    arabic: 'اللَّهُمَّ حَبِّبْ إِلَيَّ فِيهِ الإِحْسَانَ وَكَرِّهْ إِلَيَّ فِيهِ الْفُسُوقَ وَالْعِصْيَانَ',
    translation: 'O Allah, make me love goodness in it and make me detest sinfulness and disobedience.',
    transliteration: "Allahumma habbib ilayya fihil-ihsan wa karrih ilayya fihil-fusuq wal-'isyan",
    theme: 'Righteousness',
  },
  {
    id: 12,
    dayNumber: 12,
    arabic: 'اللَّهُمَّ زَيِّنِّي فِيهِ بِالسِّتْرِ وَالْعَفَافِ وَاسْتُرْنِي فِيهِ بِلِبَاسِ الْقُنُوعِ وَالْكَفَافِ',
    translation: 'O Allah, adorn me in it with modesty and chastity, and cover me with the garment of contentment.',
    transliteration: "Allahumma zayyinni fihi bis-sitri wal-'afaf wasturni fihi bilibasil-qunu'i wal-kafaf",
    theme: 'Modesty',
  },
  {
    id: 13,
    dayNumber: 13,
    arabic: 'اللَّهُمَّ طَهِّرْنِي فِيهِ مِنَ الدَّنَسِ وَالأَقْذَارِ وَصَبِّرْنِي فِيهِ عَلَى كَائِنَاتِ الأَقْدَارِ',
    translation: 'O Allah, purify me in it from impurity and dirt, and grant me patience with what destiny brings.',
    transliteration: "Allahumma tahhirni fihi minad-danasi wal-aqdhaar wa sabbirni fihi 'ala ka'inatil-aqdar",
    theme: 'Purification',
  },
  {
    id: 14,
    dayNumber: 14,
    arabic: 'اللَّهُمَّ لاَ تُؤَاخِذْنِي فِيهِ بِالْعَثَرَاتِ وَأَقِلْنِي فِيهِ مِنَ الْخَطَايَا وَالْهَفَوَاتِ',
    translation: 'O Allah, do not hold me accountable for stumbles and relieve me of mistakes and errors.',
    transliteration: "Allahumma la tu'akhidhni fihil-'atharat wa aqilni fihil-khataya wal-hafawat",
    theme: 'Pardon',
  },
  {
    id: 15,
    dayNumber: 15,
    arabic: 'اللَّهُمَّ ارْزُقْنِي فِيهِ طَاعَةَ الْخَاشِعِينَ وَاشْرَحْ فِيهِ صَدْرِي بِإِنَابَةِ الْمُخْبِتِينَ',
    translation: 'O Allah, grant me the obedience of the humble and expand my chest with the repentance of the devoted.',
    transliteration: "Allahumma arzuqni fihi ta'atal-khashi'in washrah fihi sadri bi-inabatil-mukhbitin",
    theme: 'Humility',
  },
  {
    id: 16,
    dayNumber: 16,
    arabic: 'اللَّهُمَّ وَفِّقْنِي فِيهِ لِمُوَافَقَةِ الأَبْرَارِ وَجَنِّبْنِي فِيهِ مُرَافَقَةَ الأَشْرَارِ',
    translation: 'O Allah, grant me success in keeping company with the righteous and keep me from the company of the wicked.',
    transliteration: "Allahumma waffiqni fihi limuwafaqatil-abrar wa jannibni fihi murafaqatal-ashrar",
    theme: 'Good Company',
  },
  {
    id: 17,
    dayNumber: 17,
    arabic: 'اللَّهُمَّ اهْدِنِي فِيهِ لِصَالِحِ الأَعْمَالِ وَاقْضِ لِي فِيهِ الْحَوَائِجَ وَالآمَالَ',
    translation: 'O Allah, guide me in it to righteous deeds and fulfill my needs and hopes.',
    transliteration: "Allahumma ahdini fihi lisalihil-a'mal waqdi li fihil-hawa'ij wal-amal",
    theme: 'Good Deeds',
  },
  {
    id: 18,
    dayNumber: 18,
    arabic: 'اللَّهُمَّ نَبِّهْنِي فِيهِ لِبَرَكَاتِ أَسْحَارِهِ وَنَوِّرْ فِيهِ قَلْبِي بِضِيَاءِ أَنْوَارِهِ',
    translation: 'O Allah, awaken me to the blessings of its pre-dawn hours and illuminate my heart with its radiant light.',
    transliteration: "Allahumma nabbihni fihi libarakati asharih wa nawwir fihi qalbi bidiya'i anwarih",
    theme: 'Dawn Blessings',
  },
  {
    id: 19,
    dayNumber: 19,
    arabic: 'اللَّهُمَّ وَسِّعْ لِي فِيهِ أَبْوَابَ الْجِنَانِ وَأَغْلِقْ عَنِّي فِيهِ أَبْوَابَ النِّيرَانِ',
    translation: 'O Allah, open for me in it the doors of Paradise and close for me the doors of Hellfire.',
    transliteration: "Allahumma wassi' li fihi abwabal-jinan wa aghliq 'anni fihi abwaban-niran",
    theme: 'Paradise',
  },
  {
    id: 20,
    dayNumber: 20,
    arabic: 'اللَّهُمَّ افْتَحْ لِي فِيهِ أَبْوَابَ الْجِنَانِ وَأَغْلِقْ عَنِّي فِيهِ أَبْوَابَ النِّيرَانِ وَوَفِّقْنِي فِيهِ لِتِلاَوَةِ الْقُرْآنِ',
    translation: 'O Allah, open for me the doors of Paradise, close for me the doors of Hellfire, and grant me success in reciting the Quran.',
    transliteration: "Allahumma iftah li fihi abwabal-jinan wa aghliq 'anni fihi abwaban-niran wa waffiqni fihi litilawatil-Quran",
    theme: 'Quran',
  },
  {
    id: 21,
    dayNumber: 21,
    arabic: 'اللَّهُمَّ اجْعَلْ لِي فِيهِ إِلَى مَرْضَاتِكَ دَلِيلاً وَلاَ تَجْعَلْ لِلشَّيْطَانِ فِيهِ عَلَيَّ سَبِيلاً',
    translation: 'O Allah, make for me in it a guide to Your pleasure and do not give Shaytan any way over me.',
    transliteration: "Allahumma aj'al li fihi ila mardatika dalilan wa la taj'al lish-shaytani fihi 'alayya sabila",
    theme: 'Last 10 Nights',
  },
  {
    id: 22,
    dayNumber: 22,
    arabic: 'اللَّهُمَّ افْتَحْ لِي فِيهِ أَبْوَابَ فَضْلِكَ وَأَنْزِلْ عَلَيَّ فِيهِ بَرَكَاتِكَ',
    translation: 'O Allah, open for me the doors of Your grace and send down upon me Your blessings.',
    transliteration: "Allahumma iftah li fihi abwaba fadlik wa anzil 'alayya fihi barakatik",
    theme: 'Blessings',
  },
  {
    id: 23,
    dayNumber: 23,
    arabic: 'اللَّهُمَّ اغْسِلْنِي فِيهِ مِنَ الذُّنُوبِ وَطَهِّرْنِي فِيهِ مِنَ الْعُيُوبِ',
    translation: 'O Allah, wash away my sins and cleanse me from faults.',
    transliteration: "Allahumma ighsilni fihiminadh-dhunub wa tahhirni fihil-'uyub",
    theme: 'Laylatul Qadr',
  },
  {
    id: 24,
    dayNumber: 24,
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ فِيهِ مَا يُرْضِيكَ وَأَعُوذُ بِكَ مِمَّا يُؤْذِيكَ',
    translation: 'O Allah, I ask You for what pleases You and seek refuge in You from what displeases You.',
    transliteration: "Allahumma inni as'aluka fihi ma yurdik wa a'udhu bika mimma yu'dhik",
    theme: 'Seeking Pleasure',
  },
  {
    id: 25,
    dayNumber: 25,
    arabic: 'اللَّهُمَّ اجْعَلْنِي فِيهِ مُحِبًّا لأَوْلِيَائِكَ وَمُعَادِيًا لأَعْدَائِكَ مُسْتَنًّا بِسُنَّةِ خَاتَمِ أَنْبِيَائِكَ',
    translation: 'O Allah, make me a lover of Your allies, an enemy of Your enemies, following the way of the seal of Your prophets.',
    transliteration: "Allahumma aj'alni fihi muhibban li-awliya'ik wa mu'adiyan li-a'da'ik mustannan bisunnati khatami anbiya'ik",
    theme: 'Laylatul Qadr',
  },
  {
    id: 26,
    dayNumber: 26,
    arabic: 'اللَّهُمَّ اجْعَلْ سَعْيِي فِيهِ مَشْكُورًا وَذَنْبِي فِيهِ مَغْفُورًا وَعَمَلِي فِيهِ مَقْبُولاً',
    translation: 'O Allah, make my effort appreciated, my sin forgiven, and my deeds accepted.',
    transliteration: "Allahumma aj'al sa'yi fihi mashkuran wa dhanbi fihi maghfuran wa 'amali fihi maqbulan",
    theme: 'Acceptance',
  },
  {
    id: 27,
    dayNumber: 27,
    arabic: 'اللَّهُمَّ ارْزُقْنِي فِيهِ فَضْلَ لَيْلَةِ الْقَدْرِ وَحَوِّلْ أُمُورِي فِيهِ مِنَ الْعُسْرِ إِلَى الْيُسْرِ',
    translation: 'O Allah, grant me the blessing of Laylatul Qadr and change my affairs from hardship to ease.',
    transliteration: "Allahumma arzuqni fihi fadla laylatil-qadr wa hawwil umuri fihi minal-'usri ilal-yusr",
    theme: 'Laylatul Qadr',
  },
  {
    id: 28,
    dayNumber: 28,
    arabic: 'اللَّهُمَّ وَفِّرْ حَظِّي فِيهِ مِنَ النَّوَافِلِ وَأَكْرِمْنِي فِيهِ بِإِحْضَارِ الْمَسَائِلِ',
    translation: 'O Allah, increase my share of voluntary prayers and honor me with the resolution of matters.',
    transliteration: "Allahumma waffir hazzi fihi minan-nawafil wa akrimni fihi bi-ihdaril-masa'il",
    theme: 'Extra Worship',
  },
  {
    id: 29,
    dayNumber: 29,
    arabic: 'اللَّهُمَّ غَشِّنِي فِيهِ بِالرَّحْمَةِ وَارْزُقْنِي فِيهِ التَّوْفِيقَ وَالْعِصْمَةَ',
    translation: 'O Allah, envelop me in mercy and grant me success and protection from sin.',
    transliteration: "Allahumma ghashshini fihir-rahma warzuqni fihit-tawfiq wal-'isma",
    theme: 'Laylatul Qadr',
  },
  {
    id: 30,
    dayNumber: 30,
    arabic: 'اللَّهُمَّ اجْعَلْ صِيَامِي فِيهِ بِالشُّكْرِ وَالْقَبُولِ عَلَى مَا تَرْضَاهُ وَيَرْضَاهُ الرَّسُولُ',
    translation: 'O Allah, make my fasting in it one of gratitude and acceptance, as You and the Messenger would be pleased with.',
    transliteration: "Allahumma aj'al siyami fihi bish-shukri wal-qabul 'ala ma tardahu wa yardahur-Rasul",
    theme: 'Gratitude',
  },
];
