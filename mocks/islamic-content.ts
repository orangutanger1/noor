import { Ayah, Hadith, TasbihPreset, Surah } from '@/types';

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

export const duaCategories = [
  { id: 'personal', label: 'Personal', icon: 'User', color: '#047857' },
  { id: 'family', label: 'Family', icon: 'Users', color: '#0D6E4F' },
  { id: 'health', label: 'Health', icon: 'Heart', color: '#DC2626' },
  { id: 'guidance', label: 'Guidance', icon: 'Compass', color: '#B8860B' },
  { id: 'gratitude', label: 'Gratitude', icon: 'Sparkles', color: '#2E8B57' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#6B7280' }
];

export const quranSurahs: Surah[] = [
  { number: 1, name: 'Al-Fatihah', nameArabic: 'الفاتحة', englishName: 'The Opening', ayahCount: 7, revelationType: 'Meccan' },
  { number: 2, name: 'Al-Baqarah', nameArabic: 'البقرة', englishName: 'The Cow', ayahCount: 286, revelationType: 'Medinan' },
  { number: 3, name: "Ali 'Imran", nameArabic: 'آل عمران', englishName: 'Family of Imran', ayahCount: 200, revelationType: 'Medinan' },
  { number: 4, name: 'An-Nisa', nameArabic: 'النساء', englishName: 'The Women', ayahCount: 176, revelationType: 'Medinan' },
  { number: 5, name: "Al-Ma'idah", nameArabic: 'المائدة', englishName: 'The Table Spread', ayahCount: 120, revelationType: 'Medinan' },
  { number: 6, name: "Al-An'am", nameArabic: 'الأنعام', englishName: 'The Cattle', ayahCount: 165, revelationType: 'Meccan' },
  { number: 7, name: "Al-A'raf", nameArabic: 'الأعراف', englishName: 'The Heights', ayahCount: 206, revelationType: 'Meccan' },
  { number: 8, name: 'Al-Anfal', nameArabic: 'الأنفال', englishName: 'The Spoils of War', ayahCount: 75, revelationType: 'Medinan' },
  { number: 9, name: 'At-Tawbah', nameArabic: 'التوبة', englishName: 'The Repentance', ayahCount: 129, revelationType: 'Medinan' },
  { number: 10, name: 'Yunus', nameArabic: 'يونس', englishName: 'Jonah', ayahCount: 109, revelationType: 'Meccan' },
  { number: 11, name: 'Hud', nameArabic: 'هود', englishName: 'Hud', ayahCount: 123, revelationType: 'Meccan' },
  { number: 12, name: 'Yusuf', nameArabic: 'يوسف', englishName: 'Joseph', ayahCount: 111, revelationType: 'Meccan' },
  { number: 13, name: "Ar-Ra'd", nameArabic: 'الرعد', englishName: 'The Thunder', ayahCount: 43, revelationType: 'Medinan' },
  { number: 14, name: 'Ibrahim', nameArabic: 'إبراهيم', englishName: 'Abraham', ayahCount: 52, revelationType: 'Meccan' },
  { number: 15, name: 'Al-Hijr', nameArabic: 'الحجر', englishName: 'The Rocky Tract', ayahCount: 99, revelationType: 'Meccan' },
  { number: 16, name: 'An-Nahl', nameArabic: 'النحل', englishName: 'The Bee', ayahCount: 128, revelationType: 'Meccan' },
  { number: 17, name: "Al-Isra'", nameArabic: 'الإسراء', englishName: 'The Night Journey', ayahCount: 111, revelationType: 'Meccan' },
  { number: 18, name: 'Al-Kahf', nameArabic: 'الكهف', englishName: 'The Cave', ayahCount: 110, revelationType: 'Meccan' },
  { number: 19, name: 'Maryam', nameArabic: 'مريم', englishName: 'Mary', ayahCount: 98, revelationType: 'Meccan' },
  { number: 20, name: 'Ta-Ha', nameArabic: 'طه', englishName: 'Ta-Ha', ayahCount: 135, revelationType: 'Meccan' },
  { number: 21, name: "Al-Anbiya'", nameArabic: 'الأنبياء', englishName: 'The Prophets', ayahCount: 112, revelationType: 'Meccan' },
  { number: 22, name: 'Al-Hajj', nameArabic: 'الحج', englishName: 'The Pilgrimage', ayahCount: 78, revelationType: 'Medinan' },
  { number: 23, name: "Al-Mu'minun", nameArabic: 'المؤمنون', englishName: 'The Believers', ayahCount: 118, revelationType: 'Meccan' },
  { number: 24, name: 'An-Nur', nameArabic: 'النور', englishName: 'The Light', ayahCount: 64, revelationType: 'Medinan' },
  { number: 25, name: 'Al-Furqan', nameArabic: 'الفرقان', englishName: 'The Criterion', ayahCount: 77, revelationType: 'Meccan' },
  { number: 26, name: "Ash-Shu'ara'", nameArabic: 'الشعراء', englishName: 'The Poets', ayahCount: 227, revelationType: 'Meccan' },
  { number: 27, name: 'An-Naml', nameArabic: 'النمل', englishName: 'The Ant', ayahCount: 93, revelationType: 'Meccan' },
  { number: 28, name: 'Al-Qasas', nameArabic: 'القصص', englishName: 'The Stories', ayahCount: 88, revelationType: 'Meccan' },
  { number: 29, name: "Al-'Ankabut", nameArabic: 'العنكبوت', englishName: 'The Spider', ayahCount: 69, revelationType: 'Meccan' },
  { number: 30, name: 'Ar-Rum', nameArabic: 'الروم', englishName: 'The Romans', ayahCount: 60, revelationType: 'Meccan' },
  { number: 31, name: 'Luqman', nameArabic: 'لقمان', englishName: 'Luqman', ayahCount: 34, revelationType: 'Meccan' },
  { number: 32, name: 'As-Sajdah', nameArabic: 'السجدة', englishName: 'The Prostration', ayahCount: 30, revelationType: 'Meccan' },
  { number: 33, name: 'Al-Ahzab', nameArabic: 'الأحزاب', englishName: 'The Combined Forces', ayahCount: 73, revelationType: 'Medinan' },
  { number: 34, name: "Saba'", nameArabic: 'سبأ', englishName: 'Sheba', ayahCount: 54, revelationType: 'Meccan' },
  { number: 35, name: 'Fatir', nameArabic: 'فاطر', englishName: 'Originator', ayahCount: 45, revelationType: 'Meccan' },
  { number: 36, name: 'Ya-Sin', nameArabic: 'يس', englishName: 'Ya-Sin', ayahCount: 83, revelationType: 'Meccan' },
  { number: 37, name: 'As-Saffat', nameArabic: 'الصافات', englishName: 'Those Ranged in Ranks', ayahCount: 182, revelationType: 'Meccan' },
  { number: 38, name: 'Sad', nameArabic: 'ص', englishName: 'Sad', ayahCount: 88, revelationType: 'Meccan' },
  { number: 39, name: 'Az-Zumar', nameArabic: 'الزمر', englishName: 'The Groups', ayahCount: 75, revelationType: 'Meccan' },
  { number: 40, name: 'Ghafir', nameArabic: 'غافر', englishName: 'The Forgiver', ayahCount: 85, revelationType: 'Meccan' },
  { number: 41, name: 'Fussilat', nameArabic: 'فصلت', englishName: 'Explained in Detail', ayahCount: 54, revelationType: 'Meccan' },
  { number: 42, name: 'Ash-Shura', nameArabic: 'الشورى', englishName: 'The Consultation', ayahCount: 53, revelationType: 'Meccan' },
  { number: 43, name: 'Az-Zukhruf', nameArabic: 'الزخرف', englishName: 'The Ornaments of Gold', ayahCount: 89, revelationType: 'Meccan' },
  { number: 44, name: 'Ad-Dukhan', nameArabic: 'الدخان', englishName: 'The Smoke', ayahCount: 59, revelationType: 'Meccan' },
  { number: 45, name: 'Al-Jathiyah', nameArabic: 'الجاثية', englishName: 'The Crouching', ayahCount: 37, revelationType: 'Meccan' },
  { number: 46, name: 'Al-Ahqaf', nameArabic: 'الأحقاف', englishName: 'The Wind-Curved Sandhills', ayahCount: 35, revelationType: 'Meccan' },
  { number: 47, name: 'Muhammad', nameArabic: 'محمد', englishName: 'Muhammad', ayahCount: 38, revelationType: 'Medinan' },
  { number: 48, name: 'Al-Fath', nameArabic: 'الفتح', englishName: 'The Victory', ayahCount: 29, revelationType: 'Medinan' },
  { number: 49, name: 'Al-Hujurat', nameArabic: 'الحجرات', englishName: 'The Rooms', ayahCount: 18, revelationType: 'Medinan' },
  { number: 50, name: 'Qaf', nameArabic: 'ق', englishName: 'Qaf', ayahCount: 45, revelationType: 'Meccan' },
  { number: 51, name: 'Adh-Dhariyat', nameArabic: 'الذاريات', englishName: 'The Winnowing Winds', ayahCount: 60, revelationType: 'Meccan' },
  { number: 52, name: 'At-Tur', nameArabic: 'الطور', englishName: 'The Mount', ayahCount: 49, revelationType: 'Meccan' },
  { number: 53, name: 'An-Najm', nameArabic: 'النجم', englishName: 'The Star', ayahCount: 62, revelationType: 'Meccan' },
  { number: 54, name: 'Al-Qamar', nameArabic: 'القمر', englishName: 'The Moon', ayahCount: 55, revelationType: 'Meccan' },
  { number: 55, name: 'Ar-Rahman', nameArabic: 'الرحمن', englishName: 'The Most Merciful', ayahCount: 78, revelationType: 'Medinan' },
  { number: 56, name: "Al-Waqi'ah", nameArabic: 'الواقعة', englishName: 'The Inevitable', ayahCount: 96, revelationType: 'Meccan' },
  { number: 57, name: 'Al-Hadid', nameArabic: 'الحديد', englishName: 'The Iron', ayahCount: 29, revelationType: 'Medinan' },
  { number: 58, name: 'Al-Mujadila', nameArabic: 'المجادلة', englishName: 'The Pleading Woman', ayahCount: 22, revelationType: 'Medinan' },
  { number: 59, name: 'Al-Hashr', nameArabic: 'الحشر', englishName: 'The Exile', ayahCount: 24, revelationType: 'Medinan' },
  { number: 60, name: 'Al-Mumtahanah', nameArabic: 'الممتحنة', englishName: 'She that is to be Examined', ayahCount: 13, revelationType: 'Medinan' },
  { number: 61, name: 'As-Saf', nameArabic: 'الصف', englishName: 'The Ranks', ayahCount: 14, revelationType: 'Medinan' },
  { number: 62, name: "Al-Jumu'ah", nameArabic: 'الجمعة', englishName: 'The Friday', ayahCount: 11, revelationType: 'Medinan' },
  { number: 63, name: 'Al-Munafiqun', nameArabic: 'المنافقون', englishName: 'The Hypocrites', ayahCount: 11, revelationType: 'Medinan' },
  { number: 64, name: 'At-Taghabun', nameArabic: 'التغابن', englishName: 'The Mutual Disillusion', ayahCount: 18, revelationType: 'Medinan' },
  { number: 65, name: 'At-Talaq', nameArabic: 'الطلاق', englishName: 'The Divorce', ayahCount: 12, revelationType: 'Medinan' },
  { number: 66, name: 'At-Tahrim', nameArabic: 'التحريم', englishName: 'The Prohibition', ayahCount: 12, revelationType: 'Medinan' },
  { number: 67, name: 'Al-Mulk', nameArabic: 'الملك', englishName: 'The Sovereignty', ayahCount: 30, revelationType: 'Meccan' },
  { number: 68, name: 'Al-Qalam', nameArabic: 'القلم', englishName: 'The Pen', ayahCount: 52, revelationType: 'Meccan' },
  { number: 69, name: 'Al-Haqqah', nameArabic: 'الحاقة', englishName: 'The Reality', ayahCount: 52, revelationType: 'Meccan' },
  { number: 70, name: "Al-Ma'arij", nameArabic: 'المعارج', englishName: 'The Ascending Stairways', ayahCount: 44, revelationType: 'Meccan' },
  { number: 71, name: 'Nuh', nameArabic: 'نوح', englishName: 'Noah', ayahCount: 28, revelationType: 'Meccan' },
  { number: 72, name: 'Al-Jinn', nameArabic: 'الجن', englishName: 'The Jinn', ayahCount: 28, revelationType: 'Meccan' },
  { number: 73, name: 'Al-Muzzammil', nameArabic: 'المزمل', englishName: 'The Enshrouded One', ayahCount: 20, revelationType: 'Meccan' },
  { number: 74, name: 'Al-Muddaththir', nameArabic: 'المدثر', englishName: 'The Cloaked One', ayahCount: 56, revelationType: 'Meccan' },
  { number: 75, name: 'Al-Qiyamah', nameArabic: 'القيامة', englishName: 'The Resurrection', ayahCount: 40, revelationType: 'Meccan' },
  { number: 76, name: 'Al-Insan', nameArabic: 'الإنسان', englishName: 'The Man', ayahCount: 31, revelationType: 'Medinan' },
  { number: 77, name: 'Al-Mursalat', nameArabic: 'المرسلات', englishName: 'The Emissaries', ayahCount: 50, revelationType: 'Meccan' },
  { number: 78, name: "An-Naba'", nameArabic: 'النبأ', englishName: 'The Tidings', ayahCount: 40, revelationType: 'Meccan' },
  { number: 79, name: "An-Nazi'at", nameArabic: 'النازعات', englishName: 'Those who Drag Forth', ayahCount: 46, revelationType: 'Meccan' },
  { number: 80, name: "'Abasa", nameArabic: 'عبس', englishName: 'He Frowned', ayahCount: 42, revelationType: 'Meccan' },
  { number: 81, name: 'At-Takwir', nameArabic: 'التكوير', englishName: 'The Overthrowing', ayahCount: 29, revelationType: 'Meccan' },
  { number: 82, name: 'Al-Infitar', nameArabic: 'الإنفطار', englishName: 'The Cleaving', ayahCount: 19, revelationType: 'Meccan' },
  { number: 83, name: 'Al-Mutaffifin', nameArabic: 'المطففين', englishName: 'The Defrauding', ayahCount: 36, revelationType: 'Meccan' },
  { number: 84, name: 'Al-Inshiqaq', nameArabic: 'الإنشقاق', englishName: 'The Splitting Open', ayahCount: 25, revelationType: 'Meccan' },
  { number: 85, name: 'Al-Buruj', nameArabic: 'البروج', englishName: 'The Mansions of the Stars', ayahCount: 22, revelationType: 'Meccan' },
  { number: 86, name: 'At-Tariq', nameArabic: 'الطارق', englishName: 'The Morning Star', ayahCount: 17, revelationType: 'Meccan' },
  { number: 87, name: "Al-A'la", nameArabic: 'الأعلى', englishName: 'The Most High', ayahCount: 19, revelationType: 'Meccan' },
  { number: 88, name: 'Al-Ghashiyah', nameArabic: 'الغاشية', englishName: 'The Overwhelming', ayahCount: 26, revelationType: 'Meccan' },
  { number: 89, name: 'Al-Fajr', nameArabic: 'الفجر', englishName: 'The Dawn', ayahCount: 30, revelationType: 'Meccan' },
  { number: 90, name: 'Al-Balad', nameArabic: 'البلد', englishName: 'The City', ayahCount: 20, revelationType: 'Meccan' },
  { number: 91, name: 'Ash-Shams', nameArabic: 'الشمس', englishName: 'The Sun', ayahCount: 15, revelationType: 'Meccan' },
  { number: 92, name: 'Al-Layl', nameArabic: 'الليل', englishName: 'The Night', ayahCount: 21, revelationType: 'Meccan' },
  { number: 93, name: 'Ad-Duha', nameArabic: 'الضحى', englishName: 'The Morning Hours', ayahCount: 11, revelationType: 'Meccan' },
  { number: 94, name: 'Ash-Sharh', nameArabic: 'الشرح', englishName: 'The Relief', ayahCount: 8, revelationType: 'Meccan' },
  { number: 95, name: 'At-Tin', nameArabic: 'التين', englishName: 'The Fig', ayahCount: 8, revelationType: 'Meccan' },
  { number: 96, name: "Al-'Alaq", nameArabic: 'العلق', englishName: 'The Clot', ayahCount: 19, revelationType: 'Meccan' },
  { number: 97, name: 'Al-Qadr', nameArabic: 'القدر', englishName: 'The Power', ayahCount: 5, revelationType: 'Meccan' },
  { number: 98, name: 'Al-Bayyinah', nameArabic: 'البينة', englishName: 'The Clear Proof', ayahCount: 8, revelationType: 'Medinan' },
  { number: 99, name: 'Az-Zalzalah', nameArabic: 'الزلزلة', englishName: 'The Earthquake', ayahCount: 8, revelationType: 'Medinan' },
  { number: 100, name: "Al-'Adiyat", nameArabic: 'العاديات', englishName: 'The Courser', ayahCount: 11, revelationType: 'Meccan' },
  { number: 101, name: "Al-Qari'ah", nameArabic: 'القارعة', englishName: 'The Calamity', ayahCount: 11, revelationType: 'Meccan' },
  { number: 102, name: 'At-Takathur', nameArabic: 'التكاثر', englishName: 'The Rivalry in Worldly Increase', ayahCount: 8, revelationType: 'Meccan' },
  { number: 103, name: "Al-'Asr", nameArabic: 'العصر', englishName: 'The Declining Day', ayahCount: 3, revelationType: 'Meccan' },
  { number: 104, name: 'Al-Humazah', nameArabic: 'الهمزة', englishName: 'The Traducer', ayahCount: 9, revelationType: 'Meccan' },
  { number: 105, name: 'Al-Fil', nameArabic: 'الفيل', englishName: 'The Elephant', ayahCount: 5, revelationType: 'Meccan' },
  { number: 106, name: 'Quraysh', nameArabic: 'قريش', englishName: 'Quraysh', ayahCount: 4, revelationType: 'Meccan' },
  { number: 107, name: "Al-Ma'un", nameArabic: 'الماعون', englishName: 'The Small Kindnesses', ayahCount: 7, revelationType: 'Meccan' },
  { number: 108, name: 'Al-Kawthar', nameArabic: 'الكوثر', englishName: 'The Abundance', ayahCount: 3, revelationType: 'Meccan' },
  { number: 109, name: 'Al-Kafirun', nameArabic: 'الكافرون', englishName: 'The Disbelievers', ayahCount: 6, revelationType: 'Meccan' },
  { number: 110, name: 'An-Nasr', nameArabic: 'النصر', englishName: 'The Divine Support', ayahCount: 3, revelationType: 'Medinan' },
  { number: 111, name: 'Al-Masad', nameArabic: 'المسد', englishName: 'The Palm Fiber', ayahCount: 5, revelationType: 'Meccan' },
  { number: 112, name: 'Al-Ikhlas', nameArabic: 'الإخلاص', englishName: 'The Sincerity', ayahCount: 4, revelationType: 'Meccan' },
  { number: 113, name: 'Al-Falaq', nameArabic: 'الفلق', englishName: 'The Daybreak', ayahCount: 5, revelationType: 'Meccan' },
  { number: 114, name: 'An-Nas', nameArabic: 'الناس', englishName: 'Mankind', ayahCount: 6, revelationType: 'Meccan' },
];
