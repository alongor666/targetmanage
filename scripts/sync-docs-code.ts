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
}

// 运行
main().catch(console.error);
