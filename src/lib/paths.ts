/**
 * 获取静态资源的完整路径（包含basePath）
 * 在生产环境（GitHub Pages）中自动添加basePath
 */
export function getAssetPath(path: string): string {
  // 确保路径以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 在生产环境中添加basePath
  if (process.env.NODE_ENV === 'production') {
    const basePath = '/targetmanage';
    return `${basePath}${normalizedPath}`;
  }

  return normalizedPath;
}
