// src/components/GongsuTab.jsx
import React from "react";
import { formatGongsu, getDayColor } from "../utils";

export default function GongsuTab({
  months,
  selectedMonth,
  handleMonthChange,
  summary,
  calendarCells,
  todayInfo,
  selectedYear,
  selectedMonthNum,
}) {
  const totalGongsu =
    typeof summary?.totalGongsu === "number"
      ? summary.totalGongsu
      : typeof summary?.total === "number"
      ? summary.total
      : Array.isArray(summary?.days)
      ? summary.days.reduce((sum, item) => sum + Number(item?.value || 0), 0)
      : 0;

  return (
    <div className="card gongsu-card">
      <div className="gongsu-topbar">
        <div className="gongsu-title-wrap">
          <div className="gongsu-badge">월 공수 현황</div>
        </div>

        <div className="gongsu-control-wrap">
          <select
            className="month-select"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
          >
            {months.length === 0 ? (
              <option value="">조회 가능 월 없음</option>
            ) : (
              months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
            )}
          </select>

          <div className="total-box corporate-total-box">
            <span className="total-label">총공수</span>
            <span className="total-value">{formatGongsu(totalGongsu)}</span>
          </div>
        </div>
      </div>

      {!summary ? (
        <div className="empty-box">선택된 월의 데이터가 없습니다.</div>
      ) : (
        <>
          <div className="calendar-week-header">
            <div className="week-name sun">일</div>
            <div className="week-name">월</div>
            <div className="week-name">화</div>
            <div className="week-name">수</div>
            <div className="week-name">목</div>
            <div className="week-name">금</div>
            <div className="week-name sat">토</div>
          </div>

          <div className="calendar-grid">
            {calendarCells.map((cell) => {
              if (cell.type === "empty") {
                return <div key={cell.key} className="calendar-cell empty" />;
              }

              const isToday =
                selectedYear === todayInfo.year &&
                selectedMonthNum === todayInfo.month &&
                cell.day === todayInfo.day;

              const hasValue = Number(cell.value || 0) > 0;

              return (
                <div
                  key={cell.key}
                  className={`calendar-cell ${hasValue ? "has-value" : ""} ${
                    isToday ? "today" : ""
                  }`}
                >
                  <div className={`calendar-day ${cell.weekdayClass}`}>
                    {cell.day}
                  </div>

                  <div className="calendar-body">
                    {hasValue ? (
                      <>
                        <div className="calendar-label">공수</div>
                        <div
                          className="calendar-value"
                          style={{
                            color: getDayColor(selectedMonth, cell.day),
                          }}
                        >
                          {formatGongsu(cell.value)}
                        </div>
                      </>
                    ) : (
                      <div className="calendar-empty">-</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
