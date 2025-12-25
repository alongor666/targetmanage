/**
 * 机构ID一致性验证工具
 * 确保数据文件中的机构ID与标准映射表完全一致
 */

/**
 * 验证结果类型
 */
export type ValidationResult = {
  valid: boolean;        // 是否完全匹配
  missing: string[];    // 标准表中存在但数据中缺失的机构ID
  extra: string[];      // 数据中存在但标准表中缺失的机构ID
};

/**
 * 验证数据文件中的机构ID是否在标准映射表中
 * @doc docs/business/指标定义规范.md:9-10
 * @param dataOrgIds 数据文件中的机构ID数组
 * @param standardOrgIds 标准映射表中的机构ID数组
 * @returns 验证结果对象
 */
export function validateOrganizationIds(
  dataOrgIds: string[],
  standardOrgIds: string[]
): ValidationResult {
  const standard = new Set(standardOrgIds);
  const data = new Set(dataOrgIds);

  const missing = standardOrgIds.filter(id => !data.has(id));
  const extra = dataOrgIds.filter(id => !standard.has(id));

  return {
    valid: missing.length === 0 && extra.length === 0,
    missing,
    extra,
  };
}

/**
 * 生成验证报告文本
 * @doc docs/business/指标定义规范.md:9-10
 * @param result 验证结果
 * @param dataSource 数据来源描述（如文件名）
 * @returns 格式化的验证报告
 */
export function generateValidationReport(result: ValidationResult, dataSource: string): string {
  if (result.valid) {
    return `✅ ${dataSource}: 机构ID验证通过，完全匹配标准映射表`;
  }

  const issues: string[] = [];
  
  if (result.missing.length > 0) {
    issues.push(`缺失机构: ${result.missing.join(', ')}`);
  }
  
  if (result.extra.length > 0) {
    issues.push(`多余机构: ${result.extra.join(', ')}`);
  }

  return `❌ ${dataSource}: 机构ID验证失败\n  ${issues.join('\n  ')}`;
}

/**
 * 验证机构数量是否符合预期（总计14个机构）
 * @doc docs/business/指标定义规范.md:9-10
 * @param count 机构数量
 * @returns 是否符合预期
 */
export function validateOrganizationCount(count: number): boolean {
  return count === 14;
}