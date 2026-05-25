// src/api.js

export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz_jJTFMlXtu0kWnzdBUZfpg1f4tW4qTZyV54oF7-rmhi53nfA0J2NeHKTgWqgHTpz3Ug/exec";

/**
 * 백엔드 응답 형태 통일
 * - ok 방식: { ok: true/false, ... }
 * - success 방식: { success: true/false, ... }
 * 둘 다 프론트에서 동일하게 처리할 수 있도록 보정
 */
function normalizeResponse(result) {
  if (!result || typeof result !== "object") {
    return {
      ok: false,
      message: "서버 응답 형식이 올바르지 않습니다.",
    };
  }

  const normalized = { ...result };

  if (typeof normalized.ok !== "boolean") {
    if (typeof normalized.success === "boolean") {
      normalized.ok = normalized.success;
    } else {
      normalized.ok = false;
    }
  }

  if (!normalized.message && normalized.error) {
    normalized.message = String(normalized.error);
  }

  return normalized;
}

/**
 * Apps Script doPost 공통 호출
 */
export async function postJson(data) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.status}`);
    }

    const result = await response.json();
    return normalizeResponse(result);
  } catch (error) {
    console.error("API 요청 실패:", error);
    return {
      ok: false,
      message: "서버와 연결할 수 없습니다. 네트워크 상태나 주소를 확인하세요.",
    };
  }
}

/**
 * 현장 목록 조회
 */
export const getSiteList = () =>
  postJson({
    mode: "siteList",
  });

/**
 * 로그인
 */
export const login = (phone8, pin, siteCode) =>
  postJson({
    mode: "login",
    phone8,
    pin,
    siteCode,
  });

/**
 * 공수 달력 조회
 */
export const getSummary = (phone8, month, siteCode, sessionToken = "") =>
  postJson({
    mode: "getSummary",
    phone8,
    month,
    siteCode,
    sessionToken,
  });

/**
 * 급여 조회
 */
export const getPayroll = (phone8, month, siteCode, sessionToken = "") =>
  postJson({
    mode: "getPayroll",
    phone8,
    month,
    siteCode,
    sessionToken,
  });

/**
 * 비밀번호 변경
 */
export const changePin = (
  phone8,
  currentPin,
  newPin,
  siteCode,
  sessionToken = ""
) =>
  postJson({
    mode: "changePin",
    phone8,
    currentPin,
    newPin,
    siteCode,
    sessionToken,
  });
