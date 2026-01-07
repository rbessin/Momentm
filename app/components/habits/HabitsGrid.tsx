import React from "react";
import { Habit, Completion } from "../../lib/types";

export default function HabitsGrid(props: {
  habits: Habit[];
  completions: Completion[];
  dates: Date[];
  isLoading: boolean;
  onToggleCompletion: (habitId: string, date: Date) => void;
}) {
  const handleHabitClick = (habit: Habit, date: Date) => {
    props.onToggleCompletion(habit.id, date);
  };

  return (
    <section className="flex bg-white rounded-xl shadow-md p-4 mb-6">
      {props.isLoading ? (
        <div className="text-indigo-500">Loading...</div>
      ) : props.habits.length === 0 ? (
        <div className="text-indigo-500">
          No habits found. Add some habits to get started!
        </div>
      ) : (
        <div className="overflow-x-auto text-indigo-500">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `200px repeat(${props.dates.length}, 40px)`,
              gap: 0,
            }}
          >
            <div className="font-semibold p-2 border-b border-r bg-gray-100 sticky left-0 top-0 z-20">
              Habit
            </div>
            {props.dates.map((date) => (
              <div
                key={date.toISOString()}
                className="font-semibold p-2 border-b text-center sticky top-0 bg-gray-100 z-10"
              >
                {date.getDate()}
              </div>
            ))}
            {props.habits.map((habit) => (
              <React.Fragment key={habit.id}>
                <div className="p-2 border-b border-r bg-gray-100 sticky left-0 z-10">
                  {habit.name}
                </div>
                {props.dates.map((date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const completed = props.completions.some(
                    (comp) =>
                      comp.habit_id === habit.id &&
                      comp.completed_date === dateStr
                  );
                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleHabitClick(habit, date)}
                      className={`p-2 border-b text-center hover:opacity-60 ${
                        completed ? "bg-green-200" : "bg-red-200"
                      }`}
                    ></button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
