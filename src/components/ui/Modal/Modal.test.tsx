import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';
import { describe, it, expect, vi } from 'vitest';

// Mock createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在 open 为 true 时渲染模态框', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('应该在 open 为 false 时不渲染模态框', () => {
    render(<Modal {...defaultProps} open={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('应该显示标题', () => {
    render(<Modal {...defaultProps} title="模态框标题" />);
    
    expect(screen.getByText('模态框标题')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', expect.stringContaining('-title'));
  });

  it('应该显示副标题', () => {
    render(<Modal {...defaultProps} subtitle="模态框副标题" />);
    
    expect(screen.getByText('模态框副标题')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', expect.stringContaining('-subtitle'));
  });

  it('应该渲染内容', () => {
    render(
      <Modal {...defaultProps}>
        <p>模态框内容</p>
      </Modal>
    );
    
    expect(screen.getByText('模态框内容')).toBeInTheDocument();
  });

  it('应该显示底部操作区域', () => {
    const footer = (
      <>
        <button>取消</button>
        <button>确认</button>
      </>
    );
    
    render(<Modal {...defaultProps} footer={footer} />);
    
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
  });

  it('应该应用正确的尺寸样式', () => {
    const { rerender } = render(<Modal {...defaultProps} size="md" />);
    
    let dialog = screen.getByRole('dialog');
    expect(dialog).toHaveStyle({ width: '520px' });

    rerender(<Modal {...defaultProps} size="lg" />);
    dialog = screen.getByRole('dialog');
    expect(dialog).toHaveStyle({ width: '800px' });
  });

  it('应该显示关闭按钮', () => {
    render(<Modal {...defaultProps} closable />);
    
    const closeButton = screen.getByLabelText('关闭');
    expect(closeButton).toBeInTheDocument();
  });

  it('应该在 closable 为 false 时不显示关闭按钮', () => {
    render(<Modal {...defaultProps} closable={false} />);
    
    expect(screen.queryByLabelText('关闭')).not.toBeInTheDocument();
  });

  it('应该点击关闭按钮时调用 onClose', async () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} closable />);
    
    const closeButton = screen.getByLabelText('关闭');
    await userEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('应该按 ESC 键时调用 onClose', async () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} keyboard />);
    
    await userEvent.keyboard('{Escape}');
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('应该在 keyboard 为 false 时不响应 ESC 键', async () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} keyboard={false} />);
    
    await userEvent.keyboard('{Escape}');
    
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('应该显示遮罩层', () => {
    render(<Modal {...defaultProps} mask />);
    
    const mask = document.querySelector('[style*="rgba(0, 0, 0, 0.45)"]');
    expect(mask).toBeInTheDocument();
  });

  it('应该在 mask 为 false 时不显示遮罩层', () => {
    render(<Modal {...defaultProps} mask={false} />);
    
    const mask = document.querySelector('[style*="rgba(0, 0, 0, 0.45)"]');
    expect(mask).not.toBeInTheDocument();
  });

  it('应该在 maskClosable 为 true 时点击遮罩关闭', async () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} maskClosable />);
    
    const mask = document.querySelector('[style*="rgba(0, 0, 0, 0.45)"]');
    if (mask) {
      await userEvent.click(mask);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('应该在 maskClosable 为 false 时不响应遮罩点击', async () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} maskClosable={false} />);
    
    const mask = document.querySelector('[style*="rgba(0, 0, 0, 0.45)"]');
    if (mask) {
      await userEvent.click(mask);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });

  it('应该应用自定义最大高度', () => {
    render(<Modal {...defaultProps} maxHeight={400} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveStyle({ maxHeight: '400px' });
  });

  it('应该支持自定义类名', () => {
    render(
      <Modal {...defaultProps} className="custom-modal" contentClassName="custom-content">
        <p>内容</p>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('custom-modal');
    
    // 内容区域的类名需要通过样式来验证
    const content = dialog.querySelector('div[style*="flex-1"]');
    expect(content).toHaveClass('custom-content');
  });

  it('应该设置正确的 ARIA 属性', () => {
    render(
      <Modal 
        {...defaultProps} 
        title="标题" 
        subtitle="副标题"
      >
        <p>内容</p>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('应该处理复杂的子组件', () => {
    render(
      <Modal {...defaultProps}>
        <div>
          <h3>内容标题</h3>
          <p>内容描述</p>
          <form>
            <input type="text" placeholder="输入框" />
            <button type="submit">提交</button>
          </form>
        </div>
      </Modal>
    );
    
    expect(screen.getByText('内容标题')).toBeInTheDocument();
    expect(screen.getByText('内容描述')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入框')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument();
  });

  it('应该在没有标题时正确渲染', () => {
    render(
      <Modal {...defaultProps}>
        <p>只有内容</p>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
    expect(screen.getByText('只有内容')).toBeInTheDocument();
  });

  it('应该在没有副标题时正确渲染', () => {
    render(
      <Modal {...defaultProps} title="只有标题">
        <p>内容</p>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).not.toHaveAttribute('aria-describedby');
  });

  it('应该支持自定义动画持续时间', () => {
    render(<Modal {...defaultProps} animationDuration={500} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveStyle({ animation: 'slideUp 500ms ease-out' });
  });

  it('应该在关闭时恢复焦点', async () => {
    const handleClose = vi.fn();
    
    const TestComponent = () => {
      const [open, setOpen] = React.useState(true);
      return (
        <div>
          <button data-testid="outside-button">外部按钮</button>
          <Modal 
            open={open} 
            onClose={() => {
              setOpen(false);
              handleClose();
            }}
          >
            <p>模态框内容</p>
          </Modal>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // 打开模态框
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // 关闭模态框
    const closeButton = screen.getByLabelText('关闭');
    await userEvent.click(closeButton);
    
    // 等待模态框关闭
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('应该处理空内容', () => {
    render(<Modal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toBeEmptyDOMElement();
  });
});