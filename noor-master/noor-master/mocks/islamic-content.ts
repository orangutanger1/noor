import { Ayah, Hadith, TasbihPreset } from '@/types';

export const dailyAyahs: Ayah[] = [
  {
    id: 1,
    surah: 2,
    surahName: "Al-Baqarah",
    surahNameArabic: "البقرة",
    ayahNumber: 286,
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond that it can bear.",
    transliteration: "La yukallifu Allahu nafsan illa wus'aha"
  },
  {
    id: 2,
    surah: 94,
    surahName: "Ash-Sharh",
    surahNameArabic: "الشرح",
    ayahNumber: 6,
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    transliteration: "Inna ma'al 'usri yusra"
  },
  {
    id: 3,
    surah: 3,
    surahName: "Ali 'Imran",
    surahNameArabic: "آل عمران",
    ayahNumber: 139,
    arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    translation: "Do not lose hope, nor be sad. You will surely be victorious if you are true believers.",
    transliteration: "Wa la tahinu wa la tahzanu wa antumul a'lawna in kuntum mu'minin"
  },
  {
    id: 4,
    surah: 13,
    surahName: "Ar-Ra'd",
    surahNameArabic: "الرعد",
    ayahNumber: 28,
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Verily, in the remembrance of Allah do hearts find rest.",
    transliteration: "Ala bi dhikrillahi tatma'innul qulub"
  },
  {
    id: 5,
    surah: 2,
    surahName: "Al-Baqarah",
    surahNameArabic: "البقرة",
    ayahNumber: 152,
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    transliteration: "Fadhkuruni adhkurkum washkuru li wala takfurun"
  },
  {
    id: 6,
    surah: 29,
    surahName: "Al-Ankabut",
    surahNameArabic: "العنكبوت",
    ayahNumber: 69,
    arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
    translation: "And those who strive for Us - We will surely guide them to Our ways.",
    transliteration: "Walladhina jahadu fina lanahdiyannahum subulana"
  },
  {
    id: 7,
    surah: 65,
    surahName: "At-Talaq",
    surahNameArabic: "الطلاق",
    ayahNumber: 3,
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "And whoever relies upon Allah - then He is sufficient for him.",
    transliteration: "Wa man yatawakkal 'ala Allahi fahuwa hasbuh"
  }
];

export const dailyHadiths: Hadith[] = [
  {
    id: 1,
    collection: "Sahih al-Bukhari",
    bookNumber: 2,
    hadithNumber: 8,
    arabic: "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ",
    translation: "Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing the prayer, paying the Zakat, making pilgrimage to the House, and fasting in Ramadan.",
    narrator: "Ibn Umar (RA)",
    grade: "Sahih"
  },
  {
    id: 2,
    collection: "Sahih Muslim",
    bookNumber: 1,
    hadithNumber: 72,
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "Anas ibn Malik (RA)",
    grade: "Sahih"
  },
  {
    id: 3,
    collection: "Sahih al-Bukhari",
    bookNumber: 78,
    hadithNumber: 6018,
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    translation: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    narrator: "Abu Hurairah (RA)",
    grade: "Sahih"
  },
  {
    id: 4,
    collection: "Jami' at-Tirmidhi",
    bookNumber: 27,
    hadithNumber: 1987,
    arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ",
    translation: "Allah is gentle and loves gentleness in all matters.",
    narrator: "Aisha (RA)",
    grade: "Sahih"
  },
  {
    id: 5,
    collection: "Sahih Muslim",
    bookNumber: 45,
    hadithNumber: 2586,
    arabic: "الْمُسْلِمُ أَخُو الْمُسْلِمِ لاَ يَظْلِمُهُ وَلاَ يَخْذُلُهُ وَلاَ يَحْقِرُهُ",
    translation: "A Muslim is the brother of a Muslim. He does not wrong him, forsake him, or despise him.",
    narrator: "Abu Hurairah (RA)",
    grade: "Sahih"
  },
  {
    id: 6,
    collection: "Sahih al-Bukhari",
    bookNumber: 81,
    hadithNumber: 6502,
    arabic: "إِذَا أَحَبَّ اللَّهُ الْعَبْدَ نَادَى جِبْرِيلَ إِنَّ اللَّهَ يُحِبُّ فُلاَنًا فَأَحِبَّهُ",
    translation: "When Allah loves a servant, He calls Jibreel and says: 'I love so-and-so, so love him.'",
    narrator: "Abu Hurairah (RA)",
    grade: "Sahih"
  },
  {
    id: 7,
    collection: "Riyad as-Salihin",
    bookNumber: 1,
    hadithNumber: 62,
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    translation: "The deeds most loved by Allah are those done consistently, even if they are small.",
    narrator: "Aisha (RA)",
    grade: "Sahih"
  }
];

export const tasbihPresets: TasbihPreset[] = [
  {
    id: '1',
    name: 'SubhanAllah',
    nameArabic: 'سُبْحَانَ اللهِ',
    arabic: 'سُبْحَانَ اللهِ',
    target: 33
  },
  {
    id: '2',
    name: 'Alhamdulillah',
    nameArabic: 'الْحَمْدُ للهِ',
    arabic: 'الْحَمْدُ للهِ',
    target: 33
  },
  {
    id: '3',
    name: 'Allahu Akbar',
    nameArabic: 'اللهُ أَكْبَرُ',
    arabic: 'اللهُ أَكْبَرُ',
    target: 34
  },
  {
    id: '4',
    name: 'La ilaha illallah',
    nameArabic: 'لَا إِلَٰهَ إِلَّا اللهُ',
    arabic: 'لَا إِلَٰهَ إِلَّا اللهُ',
    target: 100
  },
  {
    id: '5',
    name: 'Astaghfirullah',
    nameArabic: 'أَسْتَغْفِرُ اللهَ',
    arabic: 'أَسْتَغْفِرُ اللهَ',
    target: 100
  },
  {
    id: '6',
    name: 'Custom',
    nameArabic: 'مخصص',
    arabic: '',
    target: 99
  }
];

export const prayerNames = [
  { id: 'fajr', name: 'Fajr', nameArabic: 'الفجر' },
  { id: 'dhuhr', name: 'Dhuhr', nameArabic: 'الظهر' },
  { id: 'asr', name: 'Asr', nameArabic: 'العصر' },
  { id: 'maghrib', name: 'Maghrib', nameArabic: 'المغرب' },
  { id: 'isha', name: 'Isha', nameArabic: 'العشاء' }
];

export const moodOptions = [
  { id: 'grateful', label: 'Grateful', emoji: '🤲', color: '#2E8B57' },
  { id: 'peaceful', label: 'Peaceful', emoji: '☮️', color: '#4682B4' },
  { id: 'reflective', label: 'Reflective', emoji: '🌙', color: '#C9A227' },
  { id: 'hopeful', label: 'Hopeful', emoji: '✨', color: '#0D6E4F' },
  { id: 'struggling', label: 'Struggling', emoji: '💪', color: '#8B4513' }
];
