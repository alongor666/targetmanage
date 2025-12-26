import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button', () => {
  const defaultProps = {
    children: '测试按钮',
  };

  it('应该正确渲染基础按钮', () => {
    render(<Button {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('测试按钮');
  });

  it('应该应用正确的变体样式', () => {
    const { rerender } = render(<Button {...defaultProps} variant="outline" />);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('border-[#cccccc]'); // outline 变体的边框色
    
    rerender(<Button {...defaultProps} variant="ghost" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border-transparent'); // ghost 变体透明边框
    
    rerender(<Button {...defaultProps} variant="link" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('text-[#0070c0]'); // link 变体的特斯拉蓝色
  });

  it('应该应用正确的尺寸样式', () => {
    const { rerender } = render(<Button {...defaultProps} size="sm" />);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-8'); // sm: 32px
    expect(button).toHaveClass('text-xs'); // sm: 12px
    
    rerender(<Button {...defaultProps} size="md" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-10'); // md: 40px
    expect(button).toHaveClass('text-sm'); // md: 14px
    
    rerender(<Button {...defaultProps} size="lg" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-12'); // lg: 48px
    expect(button).toHaveClass('text-base'); // lg: 16px
  });

  it('应该支持全宽模式', () => {
    render(<Button {...defaultProps} fullWidth />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('应该正确处理禁用状态', () => {
    render(<Button {...defaultProps} disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
    expect(button).toHaveClass('text-[#999999]'); // 禁用文字色
  });

  it('应该正确处理加载状态', () => {
    render(<Button {...defaultProps} loading />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-wait');
    expect(button).toHaveClass('opacity-70');
    
    // 检查加载图标
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('应该支持左侧图标', () => {
    const LeftIcon = () => <span data-testid="left-icon">左图标</span>;
    render(<Button {...defaultProps} leftIcon={<LeftIcon />} />);
    
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('left-icon');
    expect(icon).toBeInTheDocument();
    expect(button).toContainElement(icon);
  });

  it('应该支持右侧图标', () => {
    const RightIcon = () => <span data-testid="right-icon">右图标</span>;
    render(<Button {...defaultProps} rightIcon={<RightIcon />} />);
    
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('right-icon');
    expect(icon).toBeInTheDocument();
    expect(button).toContainElement(icon);
  });

  it('应该在加载时隐藏图标', () => {
    const LeftIcon = () => <span data-testid="left-icon">左图标</span>;
    render(<Button {...defaultProps} leftIcon={<LeftIcon />} loading />);
    
    const icon = screen.queryByTestId('left-icon');
    expect(icon).not.toBeInTheDocument();
  });

  it('应该响应点击事件', () => {
    const handleClick = vi.fn();
    render(<Button {...defaultProps} onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该在禁用时阻止点击事件', () => {
    const handleClick = vi.fn();
    render(<Button {...defaultProps} disabled onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该在加载时阻止点击事件', () => {
    const handleClick = vi.fn();
    render(<Button {...defaultProps} loading onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该支持自定义类名', () => {
    render(<Button {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('应该设置正确的按钮类型', () => {
    render(<Button {...defaultProps} type="submit" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('应该支持ref转发', () => {
    const ref = { current: null } as React.RefObject<HTMLButtonElement>;
    render(<Button {...defaultProps} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('应该正确处理长文本截断', () => {
    render(<Button {...defaultProps}>这是一个很长的按钮文本内容</Button>);
    
    const button = screen.getByRole('button');
    const textSpan = button.querySelector('.truncate');
    expect(textSpan).toBeInTheDocument();
  });

  it('应该应用悬停效果', () => {
    render(<Button {...defaultProps} variant="outline" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-[rgba(0, 112, 192, 0.05)]');
    expect(button).toHaveClass('hover:border-[#0070c0]');
  });

  it('应该应用焦点样式', () => {
    render(<Button {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus:ring-2');
    expect(button).toHaveClass('focus:ring-offset-2');
  });
});