#!/usr/bin/env tsx
/**
 * 文档-代码索引同步工具
 *
 * 功能：
 * 1. 扫描文档和代码，建立双向索引
 * 2. 检测文档-代码不一致
 * 3. 生成知识图谱
 * 4. 验证交叉引用
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import crypto from 'crypto';

// ============= 类型定义 =============

interface DocMetadata {
  id: string;
  title: string;
  category: string;
  tags: string[];
  relatedDocs: string[];
  implementedIn: string[];
  sections: Record<string, SectionMetadata>;
  lastModified: string;
  checksum: string;
}

interface SectionMetadata {
  lineRange: [number, number];
  implementations: string[];
}

interface CodeMetadata {
  id: string;
  type: 'domain-logic' | 'ui-component' | 'service' | 'schema';
  exports: string[];
  documentedIn: string[];
  usedBy: string[];
  dependencies: string[];
  functions: Record<string, FunctionMetadata>;
}

interface FunctionMetadata {
  lineRange: [number, number];
  documentation: string[];
  tests: string[];
  lastModified: string;
}

interface CrossReference {
  from: string;
  to: string;
  type: 'defines' | 'implements' | 'uses' | 'references';
  description: string;
}

interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphNode {
  id: string;
  type: 'doc' | 'code' | 'function' | 'concept';
  label: string;
  metadata: any;
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
  weight: number;
}

// ============= 扫描器 =============

class DocScanner {
  async scanDocs(docsDir: string): Promise<Map<string, DocMetadata>> {
    const docs = new Map<string, DocMetadata>();
    const mdFiles = await glob('**/*.md', { cwd: docsDir });

    for (const file of mdFiles) {
      const fullPath = path.join(docsDir, file);
      const content = await fs.readFile(fullPath, 'utf-8');
      const metadata = await this.extractDocMetadata(file, content);
      docs.set(file, metadata);
    }

    return docs;
  }

  private async extractDocMetadata(
    filePath: string,
    content: string
  ): Promise<DocMetadata> {
    const lines = content.split('\n');
    const title = this.extractTitle(lines);
    const category = this.extractCategory(filePath);
    const tags = this.extractTags(content);
    const implementedIn = this.extractCodeReferences(content);
    const sections = this.extractSections(lines);
    const relatedDocs = this.extractDocReferences(content);

    return {
      id: this.generateDocId(filePath),
      title,
      category,
      tags,
      relatedDocs,
      implementedIn,
      sections,
      lastModified: new Date().toISOString(),
      checksum: this.calculateChecksum(content),
    };
  }

  private extractTitle(lines: string[]): string {
    const h1Line = lines.find((l) => l.startsWith('# '));
    return h1Line ? h1Line.replace('# ', '').trim() : 'Untitled';
  }

  private extractCategory(filePath: string): string {
    const parts = filePath.split('/');
    return parts.length > 1 ? parts[0] : 'other';
  }

  private extractTags(content: string): string[] {
    // 从标题、关键词中提取标签
    const tags = new Set<string>();

    // 提取二级标题作为标签
    const headers = content.match(/^##\s+(.+)$/gm) || [];
    headers.forEach((h) => {
      const tag = h.replace(/^##\s+/, '').trim();
      if (tag.length < 30) tags.add(tag);
    });

    return Array.from(tags);
  }

  private extractCodeReferences(content: string): string[] {
    const refs = new Set<string>();

    // 匹配 `src/...` 路径
    const pathPattern = /`(src\/[^`]+\.(ts|tsx|js|jsx))/g;
    let match;
    while ((match = pathPattern.exec(content)) !== null) {
      let codePath = match[1];
      // 调试输出
      if (codePath.includes('page')) {
        console.error(`[DEBUG] Raw match: ${codePath}`);
      }
      // 规范化路径：去除 src/ 前缀（因为code Map的键是相对于src/目录的）
      if (codePath.startsWith('src/')) {
        codePath = codePath.substring(4); // 去除 "src/" 前缀（4个字符）
      }
      if (codePath.includes('page')) {
        console.error(`[DEBUG] Normalized: ${codePath}`);
      }
      refs.add(codePath);
    }

    return Array.from(refs);
  }

  private extractSections(lines: string[]): Record<string, SectionMetadata> {
    const sections: Record<string, SectionMetadata> = {};
    let currentSection: string | null = null;
    let sectionStart = 0;

    lines.forEach((line, index) => {
      if (line.startsWith('## ')) {
        // 保存上一个section
        if (currentSection) {
          sections[currentSection].lineRange[1] = index - 1;
        }

        // 开始新section
        currentSection = line.replace('## ', '').trim();
        sectionStart = index;
        sections[currentSection] = {
          lineRange: [index, index],
          implementations: [],
        };
      } else if (currentSection && line.includes('src/')) {
        // 提取implementation引用
        const match = line.match(/src\/[^\s`]+/);
        if (match) {
          sections[currentSection].implementations.push(match[0]);
        }
      }
    });

    // 关闭最后一个section
    if (currentSection) {
      sections[currentSection].lineRange[1] = lines.length - 1;
    }

    return sections;
  }

  private extractDocReferences(content: string): string[] {
    const refs = new Set<string>();

    // 匹配 docs/...md 路径
    const pathPattern = /docs\/[^)\s]+\.md/g;
    let match;
    while ((match = pathPattern.exec(content)) !== null) {
      refs.add(match[0]);
    }

    return Array.from(refs);
  }

  private generateDocId(filePath: string): string {
    return 'doc-' + filePath.replace(/[\/\.]/g, '-').replace(/\.md$/, '');
  }

  private calculateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
  }
}

class CodeScanner {
  async scanCode(srcDir: string): Promise<Map<string, CodeMetadata>> {
    const modules = new Map<string, CodeMetadata>();
    const tsFiles = await glob('**/*.{ts,tsx}', {
      cwd: srcDir,
      ignore: ['**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
    });

    for (const file of tsFiles) {
      const fullPath = path.join(srcDir, file);
      const content = await fs.readFile(fullPath, 'utf-8');
      const metadata = await this.extractCodeMetadata(file, content);
      modules.set(file, metadata);
    }

    return modules;
  }

  private async extractCodeMetadata(
    filePath: string,
    content: string
  ): Promise<CodeMetadata> {
    const type = this.determineModuleType(filePath);
    const exports = this.extractExports(content);
    const documentedIn = this.extractDocReferences(content);
    const usedBy: string[] = []; // 需要全局扫描才能确定
    const dependencies = this.extractImports(content);
    const functions = this.extractFunctions(content);

    return {
      id: this.generateCodeId(filePath),
      type,
      exports,
      documentedIn,
      usedBy,
      dependencies,
      functions,
    };
  }

  private determineModuleType(
    filePath: string
  ): 'domain-logic' | 'ui-component' | 'service' | 'schema' {
    if (filePath.startsWith('domain/')) return 'domain-logic';
    if (filePath.startsWith('services/')) return 'service';
    if (filePath.startsWith('schemas/')) return 'schema';
    return 'ui-component';
  }

  private extractExports(content: string): string[] {
    const exports = new Set<string>();

    // 匹配 export function/const
    const exportPattern = /export\s+(?:function|const)\s+(\w+)/g;
    let match;
    while ((match = exportPattern.exec(content)) !== null) {
      exports.add(match[1]);
    }

    return Array.from(exports);
  }

  private extractDocReferences(content: string): string[] {
    const refs = new Set<string>();

    // 从JSDoc注释中提取 @doc 标记
    // 支持两种格式：@doc docs/xxx.md 或 @doc xxx.md
    const docPattern = /@doc\s+(docs\/[^\s]+|[^\s]+\.md)/g;
    let match;
    while ((match = docPattern.exec(content)) !== null) {
      let docPath = match[1];
      // 规范化路径：去除 docs/ 前缀（因为docs Map的键是相对于docs/目录的）
      if (docPath.startsWith('docs/')) {
        docPath = docPath.substring(5);
      }
      refs.add(docPath);
    }

    return Array.from(refs);
  }

  private extractImports(content: string): string[] {
    const imports = new Set<string>();

    // 匹配 import from "..."
    const importPattern = /import\s+.+\s+from\s+['"]([@\.].*)['"]/g;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.add(match[1]);
    }

    return Array.from(imports);
  }

  private extractFunctions(content: string): Record<string, FunctionMetadata> {
    const functions: Record<string, FunctionMetadata> = {};
    const lines = content.split('\n');

    let inFunction = false;
    let functionName = '';
    let functionStart = 0;
    let braceCount = 0;

    lines.forEach((line, index) => {
      // 检测函数开始
      const funcMatch = line.match(/export\s+function\s+(\w+)/);
      if (funcMatch && !inFunction) {
        inFunction = true;
        functionName = funcMatch[1];
        functionStart = index;
        braceCount = 0;
      }

      // 计算大括号
      if (inFunction) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        // 函数结束
        if (braceCount === 0 && line.includes('}')) {
          functions[functionName] = {
            lineRange: [functionStart, index],
            documentation: this.extractFunctionDocs(lines, functionStart),
            tests: [],
            lastModified: new Date().toISOString(),
          };
          inFunction = false;
        }
      }
    });

    return functions;
  }

  private extractFunctionDocs(lines: string[], functionLine: number): string[] {
    const docs: string[] = [];

    // 向上查找JSDoc注释
    for (let i = functionLine - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('/**')) {
        // 找到注释开始，向下收集
        for (let j = i; j < functionLine; j++) {
          const commentLine = lines[j].trim();
          const docMatch = commentLine.match(/@doc\s+(.+)/);
          if (docMatch) {
            docs.push(docMatch[1]);
          }
        }
        break;
      }
      if (!line.startsWith('*') && !line.startsWith('//') && line.length > 0) {
        break; // 不是注释行，停止
      }
    }

    return docs;
  }

  private generateCodeId(filePath: string): string {
    return 'code-' + filePath.replace(/[\/\.]/g, '-').replace(/\.(ts|tsx)$/, '');
  }
}

// ============= 知识图谱生成器 =============

class KnowledgeGraphBuilder {
  buildGraph(
    docs: Map<string, DocMetadata>,
    code: Map<string, CodeMetadata>
  ): KnowledgeGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // 添加文档节点
    docs.forEach((metadata, path) => {
      nodes.push({
        id: metadata.id,
        type: 'doc',
        label: metadata.title,
        metadata: { path, category: metadata.category, tags: metadata.tags },
      });

      // 文档间关联
      metadata.relatedDocs.forEach((relatedPath) => {
        const relatedDoc = docs.get(relatedPath);
        if (relatedDoc) {
          edges.push({
            from: metadata.id,
            to: relatedDoc.id,
            type: 'references',
            weight: 1,
          });
        }
      });

      // 文档-代码关联
      metadata.implementedIn.forEach((codePath) => {
        const codeModule = code.get(codePath);
        if (codeModule) {
          edges.push({
            from: metadata.id,
            to: codeModule.id,
            type: 'defines',
            weight: 2,
          });
        }
      });
    });

    // 添加代码节点
    code.forEach((metadata, path) => {
      nodes.push({
        id: metadata.id,
        type: 'code',
        label: path,
        metadata: { type: metadata.type, exports: metadata.exports },
      });

      // 代码依赖关联
      metadata.dependencies.forEach((dep) => {
        const depModule = Array.from(code.values()).find(
          (m) => dep.includes(m.id.replace('code-', ''))
        );
        if (depModule) {
          edges.push({
            from: metadata.id,
            to: depModule.id,
            type: 'imports',
            weight: 1,
          });
        }
      });
    });

    return { nodes, edges };
  }

  async exportToMermaid(graph: KnowledgeGraph): Promise<string> {
    let mermaid = 'graph TB\n';

    // 添加节点
    graph.nodes.forEach((node) => {
      const shape = node.type === 'doc' ? '[]' : '()';
      const label = node.label.replace(/["\n]/g, ' ');
      mermaid += `  ${node.id}${shape[0]}"${label}"${shape[1]}\n`;
    });

    // 添加边
    graph.edges.forEach((edge) => {
      const arrow = edge.type === 'defines' ? '==>' : '-->';
      mermaid += `  ${edge.from} ${arrow} ${edge.to}\n`;
    });

    return mermaid;
  }
}

// ============= 一致性检查器 =============

class ConsistencyChecker {
  checkDocCodeSync(
    docs: Map<string, DocMetadata>,
    code: Map<string, CodeMetadata>
  ): CheckResult[] {
    const issues: CheckResult[] = [];

    // 检查文档引用的代码是否存在
    docs.forEach((docMeta, docPath) => {
      docMeta.implementedIn.forEach((codePath) => {
        if (!code.has(codePath)) {
          issues.push({
            type: 'error',
            source: docPath,
            message: `文档引用的代码文件不存在: ${codePath}`,
            fix: `删除引用或创建文件 ${codePath}`,
          });
        }
      });
    });

    // 检查代码引用的文档是否存在
    code.forEach((codeMeta, codePath) => {
      codeMeta.documentedIn.forEach((docRef) => {
        const docPath = docRef.split(':')[0];
        if (!docs.has(docPath)) {
          issues.push({
            type: 'warning',
            source: codePath,
            message: `代码引用的文档不存在: ${docPath}`,
            fix: `创建文档 ${docPath} 或删除 @doc 标记`,
          });
        }
      });
    });

    // 检查孤立的domain函数（没有文档）
    code.forEach((codeMeta, codePath) => {
      if (codeMeta.type === 'domain-logic' && codeMeta.documentedIn.length === 0) {
        issues.push({
          type: 'warning',
          source: codePath,
          message: `业务逻辑模块缺少文档说明`,
          fix: `在函数注释中添加 @doc 标记，指向相关业务文档`,
        });
      }
    });

    return issues;
  }
}

interface CheckResult {
  type: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  fix: string;
}

// ============= 主程序 =============

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const docsDir = path.join(projectRoot, 'docs');
  const srcDir = path.join(projectRoot, 'src');
  const metaDir = path.join(docsDir, '.meta');

  // 确保meta目录存在
  await fs.mkdir(metaDir, { recursive: true });

  console.log('🔍 扫描文档和代码...\n');

  // 扫描
  const docScanner = new DocScanner();
  const codeScanner = new CodeScanner();
  const docs = await docScanner.scanDocs(docsDir);
  const code = await codeScanner.scanCode(srcDir);

  console.log(`✅ 发现 ${docs.size} 个文档文件`);
  console.log(`✅ 发现 ${code.size} 个代码模块\n`);

  // 生成知识图谱
  console.log('🕸️  生成知识图谱...\n');
  const graphBuilder = new KnowledgeGraphBuilder();
  const graph = graphBuilder.buildGraph(docs, code);

  // 保存索引
  await fs.writeFile(
    path.join(metaDir, 'docs-index.json'),
    JSON.stringify({ documents: Object.fromEntries(docs) }, null, 2)
  );

  await fs.writeFile(
    path.join(metaDir, 'code-index.json'),
    JSON.stringify({ modules: Object.fromEntries(code) }, null, 2)
  );

  await fs.writeFile(
    path.join(metaDir, 'graph.json'),
    JSON.stringify(graph, null, 2)
  );

  // 导出Mermaid图
  const mermaidGraph = await graphBuilder.exportToMermaid(graph);
  await fs.writeFile(
    path.join(metaDir, 'knowledge-graph.mmd'),
    mermaidGraph
  );

  console.log(`✅ 索引已保存到 ${metaDir}\n`);

  // 一致性检查
  console.log('🔎 检查文档-代码一致性...\n');
  const checker = new ConsistencyChecker();
  const issues = checker.checkDocCodeSync(docs, code);

  if (issues.length === 0) {
    console.log('✨ 没有发现一致性问题！\n');
  } else {
    console.log(`⚠️  发现 ${issues.length} 个问题：\n`);
    issues.forEach((issue) => {
      const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} [${issue.type.toUpperCase()}] ${issue.source}`);
      console.log(`   ${issue.message}`);
      console.log(`   💡 建议: ${issue.fix}\n`);
    });
  }

  // 输出统计
  console.log('📊 统计信息:');
  console.log(`   - 文档节点: ${graph.nodes.filter((n) => n.type === 'doc').length}`);
  console.log(`   - 代码节点: ${graph.nodes.filter((n) => n.type === 'code').length}`);
  console.log(`   - 关联边: ${graph.edges.length}`);
  console.log(`   - 文档-代码链接: ${graph.edges.filter((e) => e.type === 'defines').length}`);

  // ============= AI进化知识库索引 =============
  console.log('\n🧠 扫描AI编程进化知识库...\n');
  await syncAIEvolutionKnowledgeBase(projectRoot);
}

// ============= AI进化知识库索引生成器 =============

interface AIEvolutionProblem {
  id: string;
  title: string;
  category: string;
  status: string;
  difficulty: string;
  importance: string;
  filePath: string;
  createdDate: string;
  tags: string[];
}

interface AIEvolutionSolution {
  id: string;
  title: string;
  type: 'prompt-pattern' | 'context-pattern' | 'best-practice';
  filePath: string;
  relatedProblems: string[];
  effectImprovement: string;
}

interface AIEvolutionIndex {
  problems: Map<string, AIEvolutionProblem>;
  solutions: Map<string, AIEvolutionSolution>;
  categories: Map<string, string[]>;
  stats: {
    totalProblems: number;
    solvedProblems: number;
    totalSolutions: number;
    lastUpdated: string;
  };
}

async function syncAIEvolutionKnowledgeBase(projectRoot: string) {
  const aiEvolutionDir = path.join(projectRoot, 'docs', 'ai-evolution');
  const metaDir = path.join(aiEvolutionDir, '.meta');

  // 确保.meta目录存在
  await fs.mkdir(metaDir, { recursive: true });

  // 扫描问题记录
  const problems = await scanProblems(aiEvolutionDir);
  console.log(`✅ 发现 ${problems.size} 个问题记录`);

  // 扫描解决方案
  const solutions = await scanSolutions(aiEvolutionDir);
  console.log(`✅ 发现 ${solutions.size} 个解决方案\n`);

  // 生成分类统计
  const categories = generateCategoryStats(problems);

  // 生成统计信息
  const stats = {
    totalProblems: problems.size,
    solvedProblems: Array.from(problems.values()).filter(p => p.status === '已解决').length,
    totalSolutions: solutions.size,
    lastUpdated: new Date().toISOString(),
  };

  // 保存问题索引
  await fs.writeFile(
    path.join(metaDir, 'problems-index.json'),
    JSON.stringify({
      problems: Object.fromEntries(problems),
      categories: Object.fromEntries(categories),
      stats,
    }, null, 2)
  );

  // 保存解决方案索引
  await fs.writeFile(
    path.join(metaDir, 'solutions-index.json'),
    JSON.stringify({
      solutions: Object.fromEntries(solutions),
    }, null, 2)
  );

  // 生成进化指标
  await generateEvolutionMetrics(metaDir, problems, solutions);

  console.log(`✅ AI进化知识库索引已保存到 ${metaDir}\n`);
  console.log('📊 AI进化知识库统计:');
  console.log(`   - 问题记录: ${stats.totalProblems} 个`);
  console.log(`   - 已解决: ${stats.solvedProblems} 个`);
  console.log(`   - 解决方案: ${stats.totalSolutions} 个`);
  console.log(`   - 问题分类: ${categories.size} 个`);
}

async function scanProblems(aiEvolutionDir: string): Promise<Map<string, AIEvolutionProblem>> {
  const problems = new Map<string, AIEvolutionProblem>();
  const problemsDir = path.join(aiEvolutionDir, 'problems');

  try {
    const categories = await fs.readdir(problemsDir);

    for (const category of categories) {
      if (!category.startsWith('P0') || category === 'index.md' || category === 'template.md') {
        continue;
      }

      const categoryPath = path.join(problemsDir, category);
      const stat = await fs.stat(categoryPath);

      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);

        for (const file of files) {
          if (file.endsWith('.md')) {
            const filePath = path.join(categoryPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const problem = extractProblemMetadata(filePath, content, category);
            if (problem) {
              problems.set(problem.id, problem);
            }
          }
        }
      }
    }
  } catch (error) {
    // problems目录可能为空，忽略错误
  }

  return problems;
}

function extractProblemMetadata(
  filePath: string,
  content: string,
  category: string
): AIEvolutionProblem | null {
  const lines = content.split('\n');
  let title = '';
  let status = '未解决';
  let difficulty = '中等';
  let importance = '中';
  let createdDate = '';
  const tags: string[] = [];

  // 提取标题
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
      break;
    }
  }

  // 提取frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const statusMatch = frontmatter.match(/状态[:\s]+(.+)/);
    const difficultyMatch = frontmatter.match(/难度[:\s]+(.+)/);
    const importanceMatch = frontmatter.match(/重要性[:\s]+(.+)/);
    const dateMatch = frontmatter.match(/日期[:\s]+(.+)/);
    const tagsMatch = frontmatter.match(/标签[:\s]*\n((?:  - .+\n)+)/);

    if (statusMatch) status = statusMatch[1].trim();
    if (difficultyMatch) difficulty = difficultyMatch[1].trim();
    if (importanceMatch) importance = importanceMatch[1].trim();
    if (dateMatch) createdDate = dateMatch[1].trim();
    if (tagsMatch) {
      const tagLines = tagsMatch[1].split('\n').filter(l => l.trim());
      tags.push(...tagLines.map(l => l.replace(/^\s*- /, '').trim()));
    }
  }

  if (!title) return null;

  const id = `problem-${crypto.createHash('md5').update(filePath).digest('hex').substring(0, 8)}`;

  return {
    id,
    title,
    category,
    status,
    difficulty,
    importance,
    filePath: path.relative(path.join(filePath, '../../../..'), filePath),
    createdDate,
    tags,
  };
}

async function scanSolutions(aiEvolutionDir: string): Promise<Map<string, AIEvolutionSolution>> {
  const solutions = new Map<string, AIEvolutionSolution>();
  const solutionsDir = path.join(aiEvolutionDir, 'solutions');

  const types = [
    { dir: 'prompt-patterns', type: 'prompt-pattern' as const },
    { dir: 'context-patterns', type: 'context-pattern' as const },
    { dir: 'best-practices', type: 'best-practice' as const },
  ];

  for (const { dir, type } of types) {
    const typePath = path.join(solutionsDir, dir);
    try {
      const files = await fs.readdir(typePath);

      for (const file of files) {
        if (file.endsWith('.md') && file !== 'index.md') {
          const filePath = path.join(typePath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const solution = extractSolutionMetadata(filePath, content, type);
          if (solution) {
            solutions.set(solution.id, solution);
          }
        }
      }
    } catch (error) {
      // 目录可能不存在，忽略错误
    }
  }

  return solutions;
}

function extractSolutionMetadata(
  filePath: string,
  content: string,
  type: 'prompt-pattern' | 'context-pattern' | 'best-practice'
): AIEvolutionSolution | null {
  const lines = content.split('\n');
  let title = '';
  let effectImprovement = '';

  // 提取标题
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
      break;
    }
  }

  // 提取效果提升
  const effectMatch = content.match(/效果提升[:\s]*(.+)/);
  if (effectMatch) {
    effectImprovement = effectMatch[1].trim();
  }

  if (!title) return null;

  const id = `solution-${crypto.createHash('md5').update(filePath).digest('hex').substring(0, 8)}`;

  return {
    id,
    title,
    type,
    filePath: path.relative(path.join(filePath, '../../../..'), filePath),
    relatedProblems: [],
    effectImprovement,
  };
}

function generateCategoryStats(problems: Map<string, AIEvolutionProblem>): Map<string, string[]> {
  const categories = new Map<string, string[]>();

  problems.forEach((problem) => {
    if (!categories.has(problem.category)) {
      categories.set(problem.category, []);
    }
    categories.get(problem.category)!.push(problem.id);
  });

  return categories;
}

async function generateEvolutionMetrics(
  metaDir: string,
  problems: Map<string, AIEvolutionProblem>,
  solutions: Map<string, AIEvolutionSolution>
) {
  const metrics = {
    timestamp: new Date().toISOString(),
    problems: {
      total: problems.size,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
    },
    solutions: {
      total: solutions.size,
      byType: {} as Record<string, number>,
    },
    evolution: {
      promptSuccessRate: null as number | null,
      averageSolveTime: null as number | null,
      knowledgeReuseRate: null as number | null,
    },
  };

  // 统计问题分类
  problems.forEach((problem) => {
    metrics.problems.byCategory[problem.category] =
      (metrics.problems.byCategory[problem.category] || 0) + 1;
    metrics.problems.byStatus[problem.status] =
      (metrics.problems.byStatus[problem.status] || 0) + 1;
    metrics.problems.byDifficulty[problem.difficulty] =
      (metrics.problems.byDifficulty[problem.difficulty] || 0) + 1;
  });

  // 统计解决方案类型
  solutions.forEach((solution) => {
    metrics.solutions.byType[solution.type] =
      (metrics.solutions.byType[solution.type] || 0) + 1;
  });

  await fs.writeFile(
    path.join(metaDir, 'evolution-metrics.json'),
    JSON.stringify(metrics, null, 2)
  );
}

// 运行
main().catch(console.error);
