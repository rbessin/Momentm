import { ArrowLeft, ArrowRight, CalendarPlus } from "lucide-react";

export default function HabitsHeader(props: {
  view: "week" | "month";
  setView: React.Dispatch<React.SetStateAction<"week" | "month">>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  getPreviousDateRange: () => Date;
  getNextDateRange: () => Date;
  dates?: Date[];
  onAddHabit: () => void;
}) {
  const {
    view,
    setView,
    currentDate,
    setCurrentDate,
    getPreviousDateRange,
    getNextDateRange,
    dates,
    onAddHabit,
  } = props;

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md p-4 md:flex-row md:items-center md:justify-between mb-6">
      <h1 className="text-3xl text-indigo-500 font-bold mb-4 md:mb-0">
        Habits
      </h1>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(getPreviousDateRange())}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <ArrowLeft />
          </button>
          <span className="text-gray-700">
            {dates && dates.length > 0
              ? `${dates[0].toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })} - ${dates[dates.length - 1].toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}`
              : currentDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
          </span>
          <button
            onClick={() => setCurrentDate(getNextDateRange())}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <ArrowRight />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView("week")}
            className={`px-3 py-1 rounded-lg hover:bg-blue-500 ${
              view === "week" ? "bg-blue-700 font-semibold" : "bg-blue-300"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            className={`px-3 py-1 rounded-lg hover:bg-blue-500 ${
              view === "month" ? "bg-blue-700 font-semibold" : "bg-blue-300"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => onAddHabit()}
            className="flex space-x-2 px-3 py-1 rounded-lg hover:bg-blue-500 bg-blue-700 font-semibold"
          >
            <CalendarPlus />
            <p>Add Habit</p>
          </button>
        </div>
      </div>
    </div>
  );
}
