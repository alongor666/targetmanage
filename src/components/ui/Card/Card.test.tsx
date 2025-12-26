import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';
import { describe, it, expect, vi } from 'vitest';

describe('Card', () => {
  const defaultProps = {
    children: <p>卡片内容</p>,
  };

  it('应该正确渲染基础卡片', () => {
    render(<Card {...defaultProps} />);
    
    const card = screen.getByText('卡片内容').parentElement;
    expect(card).toBeInTheDocument();
    expect(screen.getByText('卡片内容')).toBeInTheDocument();
  });

  it('应该应用正确的变体样式', () => {
    const { rerender } = render(<Card {...defaultProps} variant="default" />);
    
    let card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ backgroundColor: '#ffffff' });
    expect(card).toHaveStyle({ border: '1px solid #f0f0f0' });

    rerender(<Card {...defaultProps} variant="outlined" />);
    card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ backgroundColor: 'transparent' });
    expect(card).toHaveStyle({ border: '1px solid #cccccc' });

    rerender(<Card {...defaultProps} variant="elevated" />);
    card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ backgroundColor: '#ffffff' });
    expect(card).toHaveStyle({ border: '1px solid transparent' });
  });

  it('应该应用正确的尺寸样式', () => {
    const { rerender } = render(<Card {...defaultProps} size="sm" />);
    
    let card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ borderRadius: '8px' });

    rerender(<Card {...defaultProps} size="md" />);
    card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ borderRadius: '12px' });

    rerender(<Card {...defaultProps} size="lg" />);
    card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ borderRadius: '16px' });
  });

  it('应该支持标题和副标题', () => {
    render(
      <Card 
        title="卡片标题" 
        subtitle="卡片副标题"
      >
        <p>卡片内容</p>
      </Card>
    );
    
    expect(screen.getByText('卡片标题')).toBeInTheDocument();
    expect(screen.getByText('卡片副标题')).toBeInTheDocument();
    expect(screen.getByText('卡片内容')).toBeInTheDocument();
  });

  it('应该支持操作区域', () => {
    const actions = <button type="button">操作按钮</button>;
    render(
      <Card actions={actions}>
        <p>卡片内容</p>
      </Card>
    );
    
    expect(screen.getByRole('button', { name: '操作按钮' })).toBeInTheDocument();
  });

  it('应该支持点击功能', async () => {
    const handleClick = vi.fn();
    render(
      <Card {...defaultProps} clickable onClick={handleClick} />
    );
    
    const card = screen.getByText('卡片内容').parentElement;
    await userEvent.click(card!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该支持悬停效果', () => {
    render(<Card {...defaultProps} hoverable />);
    
    const card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('应该支持全宽模式', () => {
    render(<Card {...defaultProps} fullWidth />);
    
    const card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveClass('w-full');
  });

  it('应该支持自定义内边距', () => {
    const { rerender } = render(<Card {...defaultProps} padding="none" />);
    
    let card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ padding: '0' });

    rerender(<Card {...defaultProps} padding="sm" />);
    card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ padding: '8px' });

    rerender(<Card {...defaultProps} padding="md" />);
    card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ padding: '16px' });

    rerender(<Card {...defaultProps} padding="lg" />);
    card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveStyle({ padding: '24px' });
  });

  it('应该响应鼠标进入事件', async () => {
    const handleMouseEnter = vi.fn();
    render(
      <Card {...defaultProps} onMouseEnter={handleMouseEnter} />
    );
    
    const card = screen.getByText('卡片内容').parentElement;
    await userEvent.hover(card!);
    
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('应该响应鼠标离开事件', async () => {
    const handleMouseLeave = vi.fn();
    render(
      <Card {...defaultProps} onMouseLeave={handleMouseLeave} />
    );
    
    const card = screen.getByText('卡片内容').parentElement;
    await userEvent.unhover(card!);
    
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('应该在可点击时设置正确的ARIA属性', () => {
    render(<Card {...defaultProps} clickable />);
    
    const card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('应该支持自定义类名', () => {
    render(
      <Card {...defaultProps} className="custom-card" contentClassName="custom-content" />
    );
    
    const card = screen.getByText('卡片内容').parentElement;
    const content = screen.getByText('卡片内容');
    
    expect(card).toHaveClass('custom-card');
    expect(content).toHaveClass('custom-content');
  });

  it('应该通过其他HTML属性', () => {
    render(
      <Card {...defaultProps} data-testid="custom-card" id="card-1" />
    );
    
    const card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveAttribute('data-testid', 'custom-card');
    expect(card).toHaveAttribute('id', 'card-1');
  });

  it('应该支持ref转发', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Card {...defaultProps} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('应该正确渲染复杂的子组件', () => {
    render(
      <Card title="复杂卡片">
        <div>
          <h3>内容标题</h3>
          <p>内容描述</p>
          <ul>
            <li>项目1</li>
            <li>项目2</li>
          </ul>
        </div>
      </Card>
    );
    
    expect(screen.getByText('复杂卡片')).toBeInTheDocument();
    expect(screen.getByText('内容标题')).toBeInTheDocument();
    expect(screen.getByText('内容描述')).toBeInTheDocument();
    expect(screen.getByText('项目1')).toBeInTheDocument();
    expect(screen.getByText('项目2')).toBeInTheDocument();
  });

  it('应该在没有内容时正常渲染', () => {
    render(<Card />);
    
    const card = document.querySelector('[class*="relative"]');
    expect(card).toBeInTheDocument();
  });

  it('应该正确处理多个操作按钮', () => {
    const actions = (
      <>
        <button type="button">取消</button>
        <button type="button">确认</button>
      </>
    );
    
    render(
      <Card actions={actions}>
        <p>卡片内容</p>
      </Card>
    );
    
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
  });

  it('应该应用过渡动画样式', () => {
    render(<Card {...defaultProps} />);
    
    const card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveClass('transition-all');
    expect(card).toHaveClass('duration-250');
    expect(card).toHaveClass('ease-out');
  });

  it('应该正确应用边框圆角', () => {
    render(<Card {...defaultProps} size="md" />);
    
    const card = screen.getByText('卡片内容').parentElement;
    expect(card).toHaveClass('rounded-lg');
  });
});