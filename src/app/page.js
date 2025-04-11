'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameWeek } from 'date-fns';
import { FaGlassCheers, FaRunning, FaPlus, FaMobileAlt, FaTrash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

const SwipeableViews = dynamic(
  () => import('react-swipeable-views').then((mod) => mod.default),
  { ssr: false }
);

const MobileWarning = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
      <FaMobileAlt className="text-4xl text-blue-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Please use Mobile View</h1>
      <p className="text-gray-600 mb-4">
        This app is optimized for mobile devices. Please switch to a smaller screen.
      </p>
      <div className="bg-blue-100 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          Tip: On desktop browsers, press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>
        </p>
      </div>
    </div>
  </div>
);

const ProgressCircle = ({ value, max, label }) => (
  <div className="text-center">
    <div className="relative w-16 h-16">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-200"
          strokeWidth="8"
          cx="50"
          cy="50"
          r="40"
          fill="none"
        />
        <circle
          className="text-blue-300"
          strokeWidth="8"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          strokeDasharray={`${(value / max) * 251} 251`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-xs font-bold">
          {value}/{max}
        </div>
      </div>
    </div>
    <div className="text-xs mt-1 text-gray-600">{label}</div>
  </div>
);

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [entries, setEntries] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calories, setCalories] = useState('');
  const [exercise, setExercise] = useState('');
  const [water, setWater] = useState(0);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const savedEntries = localStorage.getItem('calorieEntries');
    setEntries(savedEntries ? JSON.parse(savedEntries) : {});
  }, []);

  useEffect(() => {
    localStorage.setItem('calorieEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    
    setEntries(prev => ({
      ...prev,
      [dateKey]: {
        id: uuidv4(),
        date: dateKey,
        calories: parseInt(calories) || 0,
        exercise,
        water: parseInt(water) || 0
      }
    }));
    
    setCalories('');
    setExercise('');
    setWater(0);
  };

  const getWeeklySummary = () => Object.values(entries).filter(entry => 
    isSameWeek(new Date(entry.date), new Date(), { weekStartsOn: 1 })
  ).reduce((acc, curr) => acc + curr.calories, 0);

  const getDailyEncouragement = () => [
    "You're crushing it! 💪",
    "Stay hydrated! 💧",
    "Progress over perfection! 🌟",
    "Every step counts! 👟",
    "Keep pushing forward! 🚀",
    "Keep up the great work! 🌈",
    "You're doing amazing! 🌟",
    "You can do this Snacks ! 🍏",
    "Stay strong! 💪",
    "Believe in yourself! 🌟",
    "You're on the right track! 🚀"
  ][Math.floor(Math.random() * 4)];

  const deleteEntry = (date) => {
    const newEntries = { ...entries };
    delete newEntries[date];
    setEntries(newEntries);
  };

  const currentEntry = entries[format(new Date(), 'yyyy-MM-dd')];

  if (!isMobile) return <MobileWarning />;

  return (
    <main className="min-h-screen bg-gray-100 p-4 max-w-md mx-auto">
      <div className="flex justify-around mb-6 bg-white rounded-full p-2 shadow">
        {['Today', 'Week', 'Month'].map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`flex-1 py-2 rounded-full text-sm ${activeTab === index ? 'bg-blue-300 text-white' : 'text-black'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <SwipeableViews index={activeTab} onChangeIndex={setActiveTab}>
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-xl font-bold mb-4 text-black">Daily Tracking</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full p-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">Calories (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">Exercise</label>
                <input
                  type="text"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300"
                  placeholder="30min running"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">Water (glasses)</label>
                <div className="flex items-center gap-2">
                  <FaGlassCheers className="text-blue-300" />
                  <input
                    type="number"
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300"
                    min="0"
                  />
                </div>
              </div>

              <button className="w-full bg-blue-300 text-white p-3 rounded-lg flex items-center justify-center">
                <FaPlus className="mr-2" /> Add Entry
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="font-bold mb-4 text-black">Today's Progress</h3>
            <div className="flex justify-around">
              <ProgressCircle value={currentEntry?.calories || 0} max={2000} label="Calories" />
              <ProgressCircle value={(currentEntry?.water || 0) * 250} max={2000} label="Water (ml)" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="text-xl font-bold mb-4 text-black">Weekly Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
              <span className="text-gray-600">Total Calories</span>
              <span className="font-bold text-blue-600">{getWeeklySummary()} kcal</span>
            </div>
            <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
              <span className="text-gray-600">Exercise Sessions</span>
              <span className="font-bold text-green-600">
                {Object.values(entries).filter(entry => entry.exercise).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="text-xl font-bold mb-4 text-black">Monthly Overview</h2>
          <div className="grid grid-cols-7 gap-1">
            {eachDayOfInterval({
              start: startOfMonth(new Date()),
              end: endOfMonth(new Date())
            }).map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              return (
                <div 
                  key={dateStr}
                  className="aspect-square flex flex-col items-center justify-center p-1 bg-green-100 rounded-lg text-xs"
                >
                  <div className="text-xs font-medium">{format(day, 'd')}</div>
                  {entries[dateStr] && (
                    <>
                      <div className="text-[8px] text-blue-600">{entries[dateStr].calories}kcal</div>
                      <div className="text-[8px] text-green-600">{entries[dateStr].water}💧</div>
                      <FaTrash 
                        className="text-red-300 text-[8px] mt-1 cursor-pointer"
                        onClick={() => deleteEntry(dateStr)}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SwipeableViews>

      <button 
        className="fixed bottom-6 right-6 bg-blue-300 text-white p-4 rounded-full shadow-lg"
        onClick={() => setActiveTab(0)}
      >
        <FaPlus size={20} />
      </button>

      <div className="mt-4 bg-yellow-100 p-4 rounded-xl shadow">
        <p className="text-center italic text-sm text-black">"{getDailyEncouragement()}"</p>
      </div>
    </main>
  );
}