declare module 'adhan' {
  export class Coordinates {
    constructor(latitude: number, longitude: number);
    latitude: number;
    longitude: number;
  }

  export interface CalculationParameters {
    method: string;
    fajrAngle: number;
    ishaAngle: number;
    ishaInterval: number;
    madhab: string;
    highLatitudeRule: string;
    adjustments: {
      fajr: number;
      sunrise: number;
      dhuhr: number;
      asr: number;
      maghrib: number;
      isha: number;
    };
  }

  export const CalculationMethod: {
    MuslimWorldLeague(): CalculationParameters;
    Egyptian(): CalculationParameters;
    Karachi(): CalculationParameters;
    UmmAlQura(): CalculationParameters;
    Dubai(): CalculationParameters;
    MoonsightingCommittee(): CalculationParameters;
    NorthAmerica(): CalculationParameters;
    Kuwait(): CalculationParameters;
    Qatar(): CalculationParameters;
    Singapore(): CalculationParameters;
    Tehran(): CalculationParameters;
    Turkey(): CalculationParameters;
    Other(): CalculationParameters;
  };

  export class PrayerTimes {
    constructor(
      coordinates: Coordinates,
      date: Date,
      calculationParameters: CalculationParameters
    );
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
    timeForPrayer(prayer: string): Date | null;
    currentPrayer(date?: Date): string;
    nextPrayer(date?: Date): string;
  }

  export function Qibla(coordinates: Coordinates): number;

  export const Madhab: {
    Shafi: string;
    Hanafi: string;
  };

  export const HighLatitudeRule: {
    MiddleOfTheNight: string;
    SeventhOfTheNight: string;
    TwilightAngle: string;
  };

  export const Prayer: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    None: string;
  };
}
