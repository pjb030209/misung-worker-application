// src/App.js
import React, { useEffect, useState } from "react";
import misungLogo from "./misung-logo.jpg";
import { getSiteList, login, getSummary, getPayroll, changePin } from "./api";
import {
  onlyDigits,
  getCalendarCells,
  getTodayInfo,
  maskPhone8,
  normalizeMonthText,
} from "./utils";
import GongsuTab from "./components/GongsuTab";
import PayrollTab from "./components/PayrollTab";

export default function App() {
  const [siteList, setSiteList] = useState([]);
  const [siteCode, setSiteCode] = useState("");
  const [siteName, setSiteName] = useState("");

  const [phone8, setPhone8] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState("");

  const [summary, setSummary] = useState(null);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  const [payroll, setPayroll] = useState(null);
  const [payrollMonths, setPayrollMonths] = useState([]);
  const [selectedPayrollMonth, setSelectedPayrollMonth] = useState("");
  const [payrollSummary, setPayrollSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [siteLoading, setSiteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("gongsu");
  const [showPolicy, setShowPolicy] = useState(false);

  const [showPinBox, setShowPinBox] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");

  const [saveId, setSaveId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem("misung_saved_phone");
    const savedPin = localStorage.getItem("misung_saved_pin");
    const savedSaveId = localStorage.getItem("misung_save_id");
    const savedAutoLogin = localStorage.getItem("misung_auto_login");
    const savedSiteCode = localStorage.getItem("misung_site_code");
    const savedSiteName = localStorage.getItem("misung_site_name");

    if (savedSaveId === "true" && savedPhone) {
      setPhone8(savedPhone);
      setSaveId(true);
    }

    if (savedAutoLogin === "true" && savedPhone && savedPin) {
      setPhone8(savedPhone);
      setPin(savedPin);
      setSaveId(true);
      setAutoLogin(true);
    }

    if (savedSiteCode) setSiteCode(savedSiteCode);
    if (savedSiteName) setSiteName(savedSiteName);
  }, []);

  useEffect(() => {
    async function loadSites() {
      try {
        setSiteLoading(true);
        setError("");

        const data = await getSiteList();

        if (!data.ok) {
          setError(data.message || "현장 목록을 불러오지 못했습니다.");
          return;
        }

        const list = Array.isArray(data.data) ? data.data : [];
        setSiteList(list);

        if (!list.length) {
          setError("운영중인 현장 목록이 없습니다.");
          return;
        }

        const savedSiteCode = localStorage.getItem("misung_site_code");
        const matchedSavedSite = list.find(
          (item) => item.siteCode === savedSiteCode
        );

        const defaultSite = matchedSavedSite || list[0];

        setSiteCode((prev) => prev || defaultSite.siteCode || "");
        setSiteName((prev) => prev || defaultSite.siteName || "");
      } catch (err) {
        console.error(err);
        setError("현장 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setSiteLoading(false);
      }
    }

    loadSites();
  }, []);

  useEffect(() => {
    if (!siteCode || !siteList.length) return;
    const found = siteList.find((item) => item.siteCode === siteCode);
    if (found) {
      setSiteName(found.siteName || found.siteCode || "");
    }
  }, [siteCode, siteList]);

  useEffect(() => {
    if (
      autoLogin &&
      phone8 &&
      pin &&
      siteCode &&
      !user &&
      !loading &&
      !siteLoading
    ) {
      const timer = setTimeout(() => {
        const form = document.getElementById("misung-login-form");
        if (form) form.requestSubmit();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [user, loading, siteLoading, autoLogin, phone8, pin, siteCode]);

  function handleSaveIdChange(checked) {
    setSaveId(checked);

    if (!checked) {
      setAutoLogin(false);
      localStorage.removeItem("misung_saved_phone");
      localStorage.removeItem("misung_save_id");
      localStorage.removeItem("misung_saved_pin");
      localStorage.removeItem("misung_auto_login");
    }
  }

  function handleAutoLoginChange(checked) {
    setAutoLogin(checked);

    if (checked) {
      setSaveId(true);
    } else {
      localStorage.removeItem("misung_saved_pin");
      localStorage.removeItem("misung_auto_login");
    }
  }

  function handleSiteChange(nextSiteCode) {
    setSiteCode(nextSiteCode);
    const found = siteList.find((item) => item.siteCode === nextSiteCode);
    const nextSiteName = found?.siteName || nextSiteCode || "";
    setSiteName(nextSiteName);

    localStorage.setItem("misung_site_code", nextSiteCode);
    localStorage.setItem("misung_site_name", nextSiteName);
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (loading || siteLoading) return;

    const finalPhone = onlyDigits(phone8).slice(-8);
    const finalPin = onlyDigits(pin).slice(0, 4);

    if (!siteCode) {
      setError("소속 현장을 선택해 주세요.");
      return;
    }

    if (finalPhone.length !== 8) {
      setError("휴대폰 번호 뒤 8자리를 입력해 주세요.");
      return;
    }

    if (finalPin.length !== 4) {
      setError("비밀번호 4자리를 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await login(finalPhone, finalPin, siteCode);

      if (!data.ok) {
        setError(data.message || "로그인에 실패했습니다.");
        return;
      }

      const resolvedSiteName =
        data.user?.siteName ||
        siteList.find((item) => item.siteCode === siteCode)?.siteName ||
        siteName ||
        siteCode;

      setUser({
        ...(data.user || {}),
        phone8: data.user?.phone8 || finalPhone,
        siteCode,
        siteName: resolvedSiteName,
      });

      setSessionToken(data.sessionToken || "");
      setSummary(data.summary || null);
      setMonths(Array.isArray(data.months) ? data.months : []);
      setSelectedMonth(data.selectedMonth || "");
      setPayroll(data.payroll || null);
      setPayrollMonths(
        Array.isArray(data.payrollMonths) ? data.payrollMonths : []
      );
      setSelectedPayrollMonth(data.selectedPayrollMonth || "");
      setPayrollSummary(data.payrollSummary || null);

      localStorage.setItem("misung_site_code", siteCode);
      localStorage.setItem("misung_site_name", resolvedSiteName);

      if (saveId || autoLogin) {
        localStorage.setItem("misung_saved_phone", finalPhone);
        localStorage.setItem("misung_save_id", "true");
      }

      if (autoLogin) {
        localStorage.setItem("misung_saved_pin", finalPin);
        localStorage.setItem("misung_auto_login", "true");
      }

      if (!autoLogin) setPin("");
      setActiveTab("gongsu");
    } catch (err) {
      console.error(err);
      setError("연결 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMonthChange(nextMonth) {
    if (!user || !nextMonth || loading) return;

    try {
      setLoading(true);
      setError("");

      const data = await getSummary(
        user.phone8,
        nextMonth,
        user.siteCode || siteCode,
        sessionToken
      );

      if (data.ok) {
        setSelectedMonth(data.selectedMonth || nextMonth);
        setSummary(data.summary || null);
      } else {
        setError(data.message || "공수 조회에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayrollMonthChange(nextMonth) {
    if (!user || !nextMonth || loading) return;

    try {
      setLoading(true);
      setError("");

      const normalizedMonth = normalizeMonthText(nextMonth);
      const finalSiteCode = user.siteCode || siteCode;

      const [payrollData, summaryData] = await Promise.all([
        getPayroll(user.phone8, normalizedMonth, finalSiteCode, sessionToken),
        getSummary(user.phone8, normalizedMonth, finalSiteCode, sessionToken),
      ]);

      if (!payrollData.ok) {
        setError(payrollData.message || "명세서 조회 실패");
        return;
      }

      setSelectedPayrollMonth(normalizedMonth);
      setPayroll(payrollData.payroll || null);
      setPayrollSummary(summaryData.ok ? summaryData.summary : null);
    } catch (err) {
      console.error(err);
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePin(e) {
    e.preventDefault();
    if (!user || loading) return;

    const current = onlyDigits(currentPin).slice(0, 4);
    const ne = onlyDigits(newPin).slice(0, 4);
    const confirm = onlyDigits(confirmPin).slice(0, 4);

    setPinMessage("");

    if (current.length !== 4 || ne.length !== 4) {
      setPinMessage("비밀번호 4자리를 정확히 입력하세요.");
      return;
    }

    if (ne !== confirm) {
      setPinMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (current === ne) {
      setPinMessage("새로운 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const data = await changePin(
        user.phone8,
        current,
        ne,
        user.siteCode || siteCode,
        sessionToken
      );

      if (data.ok) {
        setPinMessage("비밀번호가 변경되었습니다.");
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
        setShowPinBox(false);

        if (autoLogin) {
          localStorage.setItem("misung_saved_pin", ne);
        }
      } else {
        setPinMessage(data.message || "변경에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      setPinMessage("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setPhone8("");
    setPin("");
    setError("");
    setUser(null);
    setSessionToken("");
    setSummary(null);
    setMonths([]);
    setSelectedMonth("");
    setPayroll(null);
    setPayrollMonths([]);
    setSelectedPayrollMonth("");
    setPayrollSummary(null);
    setShowPinBox(false);
    setActiveTab("gongsu");
  }

  const todayInfo = getTodayInfo();
  const rawDayList = Array.isArray(summary?.days) ? summary.days : [];
  const calendarCells = getCalendarCells(selectedMonth, rawDayList);
  const normalizedSelectedMonth = normalizeMonthText(selectedMonth);
  const [selectedYear, selectedMonthNum] = normalizedSelectedMonth
    ? normalizedSelectedMonth.split("-").map(Number)
    : [0, 0];

  const payrollDayList = Array.isArray(payrollSummary?.days)
    ? payrollSummary.days
    : [];
  const normalizedPayrollMonth = normalizeMonthText(selectedPayrollMonth);
  const payrollCalendarCells = getCalendarCells(
    normalizedPayrollMonth,
    payrollDayList
  );

  if (!user) {
    return (
      <div className="app-shell">
        <div className="login-header-blue">
          <div className="login-header-text">
            <div className="header-main">근로자 시스템</div>
            <div className="header-bottom">㈜미성기업</div>
          </div>
          <div className="login-header-logo-box">
            <img src={misungLogo} alt="로고" className="login-header-logo" />
          </div>
        </div>

        <div className="card login-card">
          <p className="sub-text login-mode-subtext">
            휴대폰 8자리와 비밀번호 4자리로 로그인합니다.
          </p>

          <form id="misung-login-form" onSubmit={handleLogin}>
            <label className="label">소속현장</label>
            <select
              className="input"
              value={siteCode}
              onChange={(e) => handleSiteChange(e.target.value)}
              disabled={siteLoading || loading}
            >
              {!siteList.length ? (
                <option value="">
                  {siteLoading ? "현장 불러오는 중..." : "현장 없음"}
                </option>
              ) : (
                siteList.map((site) => (
                  <option key={site.siteCode} value={site.siteCode}>
                    {site.siteName || site.siteCode}
                  </option>
                ))
              )}
            </select>

            <label className="label">휴대폰 뒤 8자리</label>
            <input
              className="input"
              value={phone8}
              onChange={(e) => setPhone8(onlyDigits(e.target.value).slice(-8))}
              inputMode="numeric"
              maxLength={8}
              placeholder="010 제외한 번호 입력"
            />

            <label className="label">비밀번호 4자리</label>
            <input
              type="password"
              className="input"
              value={pin}
              onChange={(e) => setPin(onlyDigits(e.target.value).slice(0, 4))}
              inputMode="numeric"
              maxLength={4}
              placeholder="초기 비밀번호: 휴대폰 뒷 4자리"
            />

            <div className="login-check-row">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={saveId}
                  onChange={(e) => handleSaveIdChange(e.target.checked)}
                />
                <span>번호 저장</span>
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={autoLogin}
                  onChange={(e) => handleAutoLoginChange(e.target.checked)}
                />
                <span>자동 로그인</span>
              </label>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button
              type="submit"
              className="primary-btn"
              disabled={loading || siteLoading || !siteCode}
            >
              {loading
                ? "연결 중..."
                : siteLoading
                ? "현장 확인 중..."
                : "로그인"}
            </button>

            <button
              type="button"
              className="policy-toggle-btn"
              onClick={() => setShowPolicy(!showPolicy)}
            >
              개인정보처리방침
            </button>

            {showPolicy && (
              <div className="policy-box">
                <div className="policy-title">
                  미성기업 개인정보처리방침(요약)
                </div>
                <div className="policy-section">
                  <b>수집 및 이용 목적</b>
                  <p>본인 확인, 공수 조회, 급여명세서 제공 등.</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="container">
        <div className="card top-card">
          <div className="top-card-header-row">
            <div className="top-logo-box left-logo">
              <img src={misungLogo} alt="로고" className="top-logo" />
            </div>
            <div className="top-title-area compact">
              <h1>공수/급여 시스템</h1>
              <p className="sub-text">
                {user.name} 님 · {maskPhone8(user.phone8)}
              </p>
              <p className="sub-text">
                {user.siteName || siteName || user.siteCode || siteCode}
              </p>
            </div>
          </div>

          <div className="top-button-grid">
            <button
              className={activeTab === "gongsu" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("gongsu")}
            >
              공수달력
            </button>

            <button
              className={activeTab === "payroll" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("payroll")}
            >
              급여명세서
            </button>

            <button
              className="outline-btn"
              onClick={() => setShowPinBox(!showPinBox)}
            >
              비밀번호 변경
            </button>

            <button className="outline-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>

        {showPinBox && (
          <div className="card" style={{ marginBottom: "16px" }}>
            <h2>비밀번호 변경</h2>
            <form onSubmit={handleChangePin}>
              <input
                type="password"
                placeholder="현재 비밀번호 (4자리)"
                className="input"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(onlyDigits(e.target.value))}
              />

              <input
                type="password"
                placeholder="새 비밀번호"
                className="input"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(onlyDigits(e.target.value))}
              />

              <input
                type="password"
                placeholder="새 비밀번호 확인"
                className="input"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(onlyDigits(e.target.value))}
              />

              {pinMessage && <p className="error-text">{pinMessage}</p>}

              <div className="pin-btn-group" style={{ marginTop: "10px" }}>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading}
                >
                  변경 저장
                </button>

                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => setShowPinBox(false)}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {activeTab === "gongsu" && (
          <GongsuTab
            months={months}
            selectedMonth={selectedMonth}
            handleMonthChange={handleMonthChange}
            summary={summary}
            calendarCells={calendarCells}
            todayInfo={todayInfo}
            selectedYear={selectedYear}
            selectedMonthNum={selectedMonthNum}
          />
        )}

        {activeTab === "payroll" && (
          <PayrollTab
            payrollMonths={payrollMonths}
            selectedPayrollMonth={selectedPayrollMonth}
            handlePayrollMonthChange={handlePayrollMonthChange}
            payroll={payroll}
            payrollSummary={payrollSummary}
            payrollCalendarCells={payrollCalendarCells}
          />
        )}
      </div>
    </div>
  );
}
