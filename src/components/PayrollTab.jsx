import React from "react";
import misungLogo from "../misung-logo.jpg";
import {
  formatPayrollTitleMonth,
  formatGongsu,
  formatPayDate,
  formatNumber,
} from "../utils";

export default function PayrollTab({
  payrollMonths,
  selectedPayrollMonth,
  handlePayrollMonthChange,
  payroll,
}) {
  const resolvedSite = payroll?.siteName || payroll?.site || "본사/현장";
  const resolvedCompany = payroll?.company || "미성기업";

  const resolvedDays = Number(payroll?.days ?? 0);

  const resolvedHolidayLabel = payroll?.holidayLabel || "휴일공수";

  const resolvedHolidayGongsu = Number(
    payroll?.holidayGongsu ?? payroll?.holidayWorkGongsu ?? 0
  );

  const resolvedMealAllowance = Number(
    payroll?.mealAllowance ?? payroll?.allowance ?? 0
  );

  const resolvedMealDeduct = Number(payroll?.mealDeduct ?? 0);

  const resolvedNps = Number(payroll?.nps ?? payroll?.nationalPension ?? 0);

  const resolvedHealth = Number(
    payroll?.health ?? payroll?.healthInsurance ?? 0
  );

  const resolvedCare = Number(payroll?.care ?? payroll?.longtermCare ?? 0);

  const resolvedEmployment = Number(
    payroll?.employment ?? payroll?.employmentInsurance ?? 0
  );

  const resolvedIncomeTax = Number(payroll?.incomeTax ?? 0);

  const resolvedLocalTax = Number(
    payroll?.localTax ?? payroll?.localIncomeTax ?? 0
  );

  const resolvedOtherDeduction = Number(
    payroll?.otherDeduction ?? payroll?.etcDeduct ?? 0
  );

  const resolvedTotalDeduction = Number(
    payroll?.totalDeduction ?? payroll?.totalDeduct ?? 0
  );

  const resolvedTotalPay = Number(payroll?.totalPay ?? 0);

  const resolvedNetPay = Number(payroll?.netPay ?? 0);

  const resolvedGongsu = Number(payroll?.gongsu ?? 0);

  const resolvedUnitPrice = Number(payroll?.unitPrice ?? 0);

  // 사업소득세 3%
  const resolvedBizTax3 = Number(payroll?.bizTax3 ?? 0);

  // 사업소득세 0.30%
  const resolvedBizTax03 = Number(
    payroll?.bizTax03 ??
      payroll?.bizTax003 ??
      payroll?.businessTax03 ??
      payroll?.businessTax003 ??
      0
  );

  const resolvedSubTotalGongsu = Number(
    payroll?.subTotalGongsu ??
      payroll?.subtotal ??
      resolvedGongsu + resolvedHolidayGongsu
  );

  return (
    <div className="card">
      <div className="section-head">
        <h2>월급명세서</h2>
        <div className="section-right">
          <select
            className="month-select"
            value={selectedPayrollMonth}
            onChange={(e) => handlePayrollMonthChange(e.target.value)}
          >
            {payrollMonths.length === 0 ? (
              <option value="">급여월 없음</option>
            ) : (
              payrollMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {!payroll ? (
        <div className="empty-box">선택된 급여월의 명세서가 없습니다.</div>
      ) : (
        <div className="payslip-wrap">
          <div className="payslip-sheet">
            <div className="payslip-head">
              <div className="payslip-head-center">
                <div className="payslip-title-row">
                  <div className="payslip-title">
                    {formatPayrollTitleMonth(selectedPayrollMonth)} 급여명세서
                  </div>
                </div>
                <div className="payslip-subtitle">
                  소속: {resolvedCompany} / 현장: {resolvedSite}
                </div>
              </div>

              <div className="payslip-logo-box">
                <img
                  src={misungLogo}
                  alt="미성기업 로고"
                  className="payslip-logo"
                />
              </div>
            </div>

            <table className="payslip-table">
              <tbody>
                <tr className="info-head">
                  <th>지급일자</th>
                  <th colSpan="2">성명</th>
                </tr>
                <tr className="info-body">
                  <td>{formatPayDate(payroll.payDate)}</td>
                  <td colSpan="2">{payroll.name}</td>
                </tr>

                <tr className="block-title pay-block">
                  <th colSpan="3">지 급</th>
                </tr>

                <tr className="sub-head">
                  <th>일수</th>
                  <th>공수</th>
                  <th>단가</th>
                </tr>

                <tr className="data-row">
                  <td>{formatNumber(resolvedDays)}</td>
                  <td>{formatGongsu(resolvedGongsu)}</td>
                  <td rowSpan="4" className="unit-price-merge">
                    {formatNumber(resolvedUnitPrice)}
                  </td>
                </tr>

                <tr className="data-row">
                  <td>{resolvedHolidayLabel}</td>
                  <td>{formatGongsu(resolvedHolidayGongsu)}</td>
                </tr>

                <tr className="data-row subtotal-row">
                  <td>소계</td>
                  <td>{formatGongsu(resolvedSubTotalGongsu)}</td>
                </tr>

                <tr className="data-row">
                  <td>식대/수당</td>
                  <td>{formatNumber(resolvedMealAllowance)}</td>
                </tr>

                <tr className="single-title">
                  <th colSpan="3">지급총액</th>
                </tr>
                <tr className="single-value">
                  <td colSpan="3">{formatNumber(resolvedTotalPay)}</td>
                </tr>

                <tr className="block-title deduction-block">
                  <th colSpan="3">공 제</th>
                </tr>

                <tr className="sub-head">
                  <th>국민연금</th>
                  <th>건강보험</th>
                  <th>장기요양</th>
                </tr>
                <tr className="data-row">
                  <td>{formatNumber(resolvedNps)}</td>
                  <td>{formatNumber(resolvedHealth)}</td>
                  <td>{formatNumber(resolvedCare)}</td>
                </tr>

                <tr className="sub-head">
                  <th>고용보험</th>
                  <th>소득세</th>
                  <th>지방소득세</th>
                </tr>
                <tr className="data-row">
                  <td>{formatNumber(resolvedEmployment)}</td>
                  <td>{formatNumber(resolvedIncomeTax)}</td>
                  <td>{formatNumber(resolvedLocalTax)}</td>
                </tr>

                <tr className="sub-head">
                  <th>사업소득세(3%)</th>
                  <th>사업소득세(0.30%)</th>
                  <th>식대공제</th>
                </tr>
                <tr className="data-row">
                  <td>{formatNumber(resolvedBizTax3)}</td>
                  <td>{formatNumber(resolvedBizTax03)}</td>
                  <td>{formatNumber(resolvedMealDeduct)}</td>
                </tr>

                <tr className="sub-head">
                  <th>공제금액(기타)</th>
                  <th></th>
                  <th></th>
                </tr>
                <tr className="data-row">
                  <td>{formatNumber(resolvedOtherDeduction)}</td>
                  <td></td>
                  <td></td>
                </tr>

                <tr className="summary-row">
                  <th colSpan="2">지급총액</th>
                  <td style={{ textAlign: "center" }}>
                    {formatNumber(resolvedTotalPay)}
                  </td>
                </tr>

                <tr className="summary-row deduct-row">
                  <th colSpan="2">공제총액</th>
                  <td style={{ textAlign: "center" }}>
                    {formatNumber(resolvedTotalDeduction)}
                  </td>
                </tr>

                <tr className="final-row">
                  <th colSpan="2">실수령액</th>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>
                    {formatNumber(resolvedNetPay)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="payslip-footer">
              <div className="payslip-company-row">
                <div className="company-name">㈜ 미 성 기 업</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
