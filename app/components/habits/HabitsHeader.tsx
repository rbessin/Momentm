import { ArrowLeft, ArrowRight } from "lucide-react";

export default function HabitsHeader(props: {
  view: "week" | "month";
  setView: React.Dispatch<React.SetStateAction<"week" | "month">>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  getPreviousDateRange: () => Date;
  getNextDateRange: () => Date;
  dates?: Date[];
}) {
  const {
    view,
    setView,
    currentDate,
    setCurrentDate,
    getPreviousDateRange,
    getNextDateRange,
    dates,
  } = props;

  return (
    <div className="flex flex-col bg-stone-50 rounded-lg shadow-sm border border-stone-200 p-3 md:flex-row md:items-center md:justify-between mb-4">
      <h1 className="text-xl text-emerald-700 font-semibold mb-3 md:mb-0">
        Habits
      </h1>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(getPreviousDateRange())}
            className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm text-stone-700 font-medium min-w-[140px] text-center">
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
            className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
        >
          Today
        </button>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setView("week")}
            className={`px-2.5 py-1 text-sm rounded-md transition-colors ${
              view === "week"
                ? "bg-emerald-600 text-white font-medium"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            className={`px-2.5 py-1 text-sm rounded-md transition-colors ${
              view === "month"
                ? "bg-emerald-600 text-white font-medium"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
            }`}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
}
