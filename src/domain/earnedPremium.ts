import { safeDivide } from "./achievement";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDays(later: Date, earlier: Date): number {
  return Math.floor((toDateOnly(later).getTime() - toDateOnly(earlier).getTime()) / MS_PER_DAY);
}

/**
 * 获取当月自然天数
 * @doc docs/business/指标定义规范.md
 * @param year 年度
 * @param month 月份（1-12）
 */
export function getMonthDays(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 当月保单到统计日期的满期天数
 * @doc docs/business/指标定义规范.md
 * @param monthStartDate 当月1日
 * @param monthDays 当月自然天数
 * @param statDate 统计日期（计入当日）
 */
export function calculateMaturityDays(
  monthStartDate: Date,
  monthDays: number,
  statDate: Date
): number {
  const nextMonthStart = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth() + 1, 1);
  const extraDays = Math.max(0, diffInDays(statDate, nextMonthStart) + 1);
  return monthDays / 2 + extraDays;
}

/**
 * 车险已赚保费
 * @doc docs/business/指标定义规范.md
 */
export function calculateAutoEarnedPremium(params: {
  commercialPremium: number;
  commercialExpenseRate: number;
  compulsoryPremium: number;
  compulsoryExpenseRate: number;
  maturityDays: number;
}): number {
  const maturityFactor = params.maturityDays / 365;
  const commercialEarned =
    params.commercialPremium * params.commercialExpenseRate * 0.94 +
    params.commercialPremium * (1 - params.commercialExpenseRate) * maturityFactor;
  const compulsoryEarned =
    params.compulsoryPremium * params.compulsoryExpenseRate * 0.82 +
    params.compulsoryPremium * (1 - params.compulsoryExpenseRate) * maturityFactor;
  return commercialEarned + compulsoryEarned;
}

/**
 * 财产险已赚保费
 * @doc docs/business/指标定义规范.md
 */
export function calculatePropertyEarnedPremium(params: {
  premium: number;
  firstDayExpenseRate: number;
  maturityDays: number;
}): number {
  const maturityFactor = params.maturityDays / 365;
  return params.premium * params.firstDayExpenseRate + params.premium * (1 - params.firstDayExpenseRate) * maturityFactor;
}

/**
 * 人身险已赚保费
 * @doc docs/business/指标定义规范.md
 */
export function calculateLifeEarnedPremium(params: {
  premium: number;
  firstDayExpenseRate: number;
  maturityDays: number;
}): number {
  const maturityFactor = params.maturityDays / 365;
  return (
    params.premium * params.firstDayExpenseRate * 0.967 +
    params.premium * (1 - params.firstDayExpenseRate) * maturityFactor
  );
}

/**
 * 满期率 = 已赚保费 / 保费收入
 * @doc docs/business/指标定义规范.md
 */
export function calculateMaturityRate(earned: number, premium: number): number | null {
  return safeDivide(earned, premium).value;
}
