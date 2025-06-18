import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from 'lucide-react';

interface StreakCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streak: number;
  streakDays: string[];
  missedDays?: string[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ 
  open, 
  onOpenChange,
  streak,
  streakDays,
  missedDays = []
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const renderCalendar = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const isToday = day === today.getDate() && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
      const isStreak = streakDays.includes(dateString);
      const isMissed = missedDays.includes(dateString);
      const isRestored = isStreak && isMissed;

      let className = "h-8 w-8 flex items-center justify-center rounded-full text-sm ";
      if (isRestored) {
        className += " bg-siksha-purple text-white border-2 border-red-500";
      } else if (isStreak) {
        className += " bg-siksha-purple text-white";
      } else if (isMissed) {
        className += " border-2 border-red-500 text-red-500";
      } else if (isToday) {
        className += " border-2 border-siksha-purple";
      }

      days.push(
        <div 
          key={day} 
          className={className}
          title={isRestored ? 'Restored day!' : isStreak ? 'You logged in on this day!' : isMissed ? 'You missed this day!' : ''}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/60 backdrop-blur-sm border-0">
        <DialogTitle>Streak Calendar</DialogTitle>
        <DialogDescription>
          Track your daily learning progress and maintain your streak.
        </DialogDescription>
        
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center bg-siksha-green/80 rounded-full px-3 py-1">
              <span className="text-sm font-bold text-siksha-purple-dark">
                {streak} day{streak !== 1 ? 's' : ''} streak
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-xs text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/80 hover:bg-white/90"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakCalendar;
