import { format, parseISO, isToday, isPast, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const getDueDateStatus = (dateString: string): {
  status: 'overdue' | 'today' | 'upcoming';
  daysOverdue?: number;
} => {
  try {
    const date = parseISO(dateString);
    const today = new Date();

    if (isPast(date) && !isToday(date)) {
      const daysOverdue = differenceInDays(today, date);
      return { status: 'overdue', daysOverdue };
    } else if (isToday(date)) {
      return { status: 'today' };
    } else {
      return { status: 'upcoming' };
    }
  } catch (error) {
    console.error('Error checking date status:', error);
    return { status: 'upcoming' };
  }
}; 