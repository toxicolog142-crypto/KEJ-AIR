export enum FlightStatus {
  Landed = 'Прибыл',
  Expected = 'Ожидается',
  Delayed = 'Задерживается',
  Cancelled = 'Отменен',
  Scheduled = 'По расписанию',
  EnRoute = 'В пути'
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  scheduledTime: string; // Format HH:mm
  estimatedTime?: string; // Format HH:mm
  status: FlightStatus;
  terminal?: string;
  aircraft?: string; // e.g., Boeing 737
  date: string; // YYYY-MM-DD
}

export interface DaySchedule {
  date: string;
  flights: Flight[];
}