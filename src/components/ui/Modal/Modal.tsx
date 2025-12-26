import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { colors, spacing, radius, typography, shadows, animations } from '@/styles/tokens';

/**
 * 模态框尺寸类型
 */
export type ModalSize = 'md' | 'lg';

/**
 * 模态框组件属性
 */
export interface ModalProps {
  /** 是否显示模态框 */
  open: boolean;
  
  /** 关闭模态框的回调 */
  onClose: () => void;
  
  /** 模态框尺寸 */
  size?: ModalSize;
  
  /** 模态框标题 */
  title?: React.ReactNode;
  
  /** 模态框副标题 */
  subtitle?: React.ReactNode;
  
  /** 底部操作区域 */
  footer?: React.ReactNode;
  
  /** 是否显示关闭按钮 */
  closable?: boolean;
  
  /** 是否显示遮罩层 */
  mask?: boolean;
  
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean;
  
  /** 按ESC键是否关闭 */
  keyboard?: boolean;
  
  /** 是否居中显示 */
  centered?: boolean;
  
  /** 自定义类名 */
  className?: string;
  
  /** 内容区域自定义类名 */
  contentClassName?: string;
  
  /** 最大高度 */
  maxHeight?: number | string;
  
  /** 动画持续时间（毫秒） */
  animationDuration?: number;
  
  /** 渲染容器 */
  container?: HTMLElement;
}

/**
 * 获取模态框尺寸配置
 * @param size 模态框尺寸
 * @returns 尺寸配置
 */
function getModalSize(size: ModalSize) {
  switch (size) {
    case 'md':
      return {
        width: '520px',
        maxWidth: '90vw',
        borderRadius: radius.lg, // 16px
        titleSize: typography.fontSize.lg, // 18px
        subtitleSize: typography.fontSize.base, // 14px
        contentSize: typography.fontSize.base // 14px
      };
    
    case 'lg':
      return {
        width: '800px',
        maxWidth: '95vw',
        borderRadius: radius.lg, // 16px
        titleSize: typography.fontSize.xl, // 24px
        subtitleSize: typography.fontSize.md, // 16px
        contentSize: typography.fontSize.md // 16px
      };
    
    default:
      return getModalSize('md');
  }
}

/**
 * 模态框遮罩层组件
 */
const ModalMask: React.FC<{ 
  visible: boolean; 
  onClick?: () => void;
  animationDuration: number;
}> = ({ visible, onClick, animationDuration }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-40"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        animation: `fadeIn ${animationDuration}ms ease-out`,
      }}
      onClick={onClick}
    />
  );
};

/**
 * 模态框内容组件
 */
const ModalContent: React.FC<{
  open: boolean;
  size: ModalSize;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  closable?: boolean;
  centered?: boolean;
  className?: string;
  contentClassName?: string;
  maxHeight?: number | string;
  animationDuration: number;
  onClose: () => void;
  children: React.ReactNode;
}> = ({
  open,
  size,
  title,
  subtitle,
  footer,
  closable = true,
  centered = true,
  className,
  contentClassName,
  maxHeight,
  animationDuration,
  onClose,
  children
}) => {
  const sizeConfig = getModalSize(size);
  const modalId = useId();

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed',
        'z-50',
        'flex',
        'items-center',
        'justify-center',
        'p-4',
        centered ? 'inset-0' : 'inset-x-0 top-0'
      )}
      style={{
        animation: `fadeIn ${animationDuration}ms ease-out`,
      }}
    >
      <div
        id={modalId}
        className={cn(
          'relative',
          'bg-white',
          'shadow-xl',
          'overflow-hidden',
          'transition-all',
          'duration-300',
          'ease-out',
          className
        )}
        style={{
          width: sizeConfig.width,
          maxWidth: sizeConfig.maxWidth,
          borderRadius: `${sizeConfig.borderRadius}px`,
          maxHeight: maxHeight || '80vh',
          display: 'flex',
          flexDirection: 'column',
          animation: `slideUp ${animationDuration}ms ease-out`,
          boxShadow: shadows.lg,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${modalId}-title` : undefined}
        aria-describedby={subtitle ? `${modalId}-subtitle` : undefined}
      >
        {/* 模态框头部 */}
        {(title || closable) && (
          <div
            className="flex items-start justify-between p-6 border-b"
            style={{ 
              borderColor: colors.border.light,
              backgroundColor: colors.background.primary
            }}
          >
            <div className="flex-1">
              {/* 标题 */}
              {title && (
                <div
                  id={`${modalId}-title`}
                  className="font-semibold text-gray-900"
                  style={{ fontSize: `${sizeConfig.titleSize}px` }}
                >
                  {title}
                </div>
              )}
              
              {/* 副标题 */}
              {subtitle && (
                <div
                  id={`${modalId}-subtitle`}
                  className="mt-1 text-gray-600"
                  style={{ fontSize: `${sizeConfig.subtitleSize}px` }}
                >
                  {subtitle}
                </div>
              )}
            </div>
            
            {/* 关闭按钮 */}
            {closable && (
              <button
                type="button"
                className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={onClose}
                aria-label="关闭"
                style={{
                  borderRadius: `${radius.sm}px`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* 模态框内容 */}
        <div
          className={cn(
            'flex-1',
            'overflow-y-auto',
            contentClassName
          )}
          style={{ 
            fontSize: `${sizeConfig.contentSize}px`,
            padding: title || footer ? '0 24px' : '24px',
            maxHeight: maxHeight ? `calc(${maxHeight}px - ${title ? 80 : 0}px - ${footer ? 80 : 0}px)` : undefined
          }}
        >
          {children}
        </div>
        
        {/* 模态框底部 */}
        {footer && (
          <div
            className="flex items-center justify-end gap-3 p-6 border-t"
            style={{ 
              borderColor: colors.border.light,
              backgroundColor: colors.background.secondary
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal - 模态框组件
 *
 * 全局可复用的模态框组件，支持多种尺寸和动画效果。
 * 严格遵循设计系统规范，使用设计令牌确保一致性。
 *
 * @example
 * 基础用法：
 * ```tsx
 * function App() {
 *   const [open, setOpen] = useState(false);
 *   
 *   return (
 *     <>
 *       <Button onClick={() => setOpen(true)}>打开模态框</Button>
 *       <Modal 
 *         open={open} 
 *         onClose={() => setOpen(false)}
 *         title="模态框标题"
 *       >
 *         <p>这是模态框的内容</p>
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * 不同尺寸：
 * ```tsx
 * <Modal open size="md" title="中等模态框">
 *   <p>中等尺寸的模态框内容</p>
 * </Modal>
 * 
 * <Modal open size="lg" title="大型模态框">
 *   <p>大型尺寸的模态框内容</p>
 * </Modal>
 * ```
 *
 * @example
 * 带副标题和操作按钮：
 * ```tsx
 * <Modal 
 *   open
 *   title="确认删除"
 *   subtitle="此操作不可撤销，请谨慎操作"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={handleCancel}>
 *         取消
 *       </Button>
 *       <Button onClick={handleConfirm}>
 *         确认删除
 *       </Button>
 *     </>
 *   }
 * >
 *   <p>确定要删除这个项目吗？</p>
 * </Modal>
 * ```
 *
 * @example
 * 自定义配置：
 * ```tsx
 * <Modal
 *   open
 *   title="自定义模态框"
 *   closable={false}
 *   maskClosable={false}
 *   keyboard={false}
 *   centered={false}
 *   maxHeight={600}
 * >
 *   <p>不可关闭的模态框</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'md',
  title,
  subtitle,
  footer,
  closable = true,
  mask = true,
  maskClosable = true,
  keyboard = true,
  centered = true,
  className,
  contentClassName,
  maxHeight,
  animationDuration = 250,
  container = document.body,
}) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 处理ESC键关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && keyboard && open) {
        event.preventDefault();
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, keyboard, onClose]);

  // 处理焦点锁定
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // 禁用背景滚动
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // 防止滚动条跳动
      
      return () => {
        // 恢复背景滚动
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // 恢复焦点
        if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [open]);

  // 处理遮罩点击
  const handleMaskClick = () => {
    if (maskClosable && open) {
      onClose();
    }
  };

  if (!open) return null;

  const modalContent = (
    <>
      {/* 遮罩层 */}
      <ModalMask
        visible={mask}
        onClick={handleMaskClick}
        animationDuration={animationDuration}
      />
      
      {/* 模态框内容 */}
      <ModalContent
        open={open}
        size={size}
        title={title}
        subtitle={subtitle}
        footer={footer}
        closable={closable}
        centered={centered}
        className={className}
        contentClassName={contentClassName}
        maxHeight={maxHeight}
        animationDuration={animationDuration}
        onClose={onClose}
      >
        {/* children 作为 ModalContent 的子组件传递 */}
      </ModalContent>
    </>
  );

  // 使用 Portal 渲染到指定容器
  return createPortal(
    modalContent,
    container
  );
};

Modal.displayName = 'Modal';

export default Modal;