import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('Input', () => {
  const defaultProps = {
    placeholder: '请输入内容',
  };

  it('应该正确渲染基础输入框', () => {
    render(<Input {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('请输入内容');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('应该支持不同的输入类型', () => {
    const { rerender } = render(<Input {...defaultProps} type="text" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');

    rerender(<Input {...defaultProps} type="password" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'password');

    rerender(<Input {...defaultProps} type="email" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input {...defaultProps} type="number" />);
    input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('应该应用正确的尺寸样式', () => {
    const { rerender } = render(<Input {...defaultProps} size="sm" />);
    
    let input = screen.getByRole('textbox');
    expect(input).toHaveStyle({ height: '32px' });
    expect(input).toHaveStyle({ fontSize: '12px' });

    rerender(<Input {...defaultProps} size="md" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveStyle({ height: '40px' });
    expect(input).toHaveStyle({ fontSize: '14px' });

    rerender(<Input {...defaultProps} size="lg" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveStyle({ height: '48px' });
    expect(input).toHaveStyle({ fontSize: '16px' });
  });

  it('应该支持标签', () => {
    render(<Input {...defaultProps} label="用户名" />);
    
    const label = screen.getByText('用户名');
    const input = screen.getByRole('textbox');
    
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
    expect(input).toHaveAttribute('aria-labelledby', label.id);
  });

  it('应该支持必填标记', () => {
    render(<Input {...defaultProps} label="密码" required />);
    
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-500');
  });

  it('应该支持禁用状态', () => {
    render(<Input {...defaultProps} disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('cursor-not-allowed');
    expect(input).toHaveClass('opacity-60');
  });

  it('应该支持只读状态', () => {
    render(<Input {...defaultProps} readonly />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveClass('cursor-default');
  });

  it('应该显示错误状态', () => {
    render(<Input {...defaultProps} error="用户名不能为空" />);
    
    const input = screen.getByRole('textbox');
    const errorMessage = screen.getByText('用户名不能为空');
    
    expect(input).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });

  it('应该显示帮助文本', () => {
    render(<Input {...defaultProps} helpText="请输入6-20个字符" />);
    
    const helpText = screen.getByText('请输入6-20个字符');
    expect(helpText).toBeInTheDocument();
  });

  it('应该支持左侧图标', () => {
    const LeftIcon = () => <span data-testid="left-icon">搜索</span>;
    render(<Input {...defaultProps} leftIcon={<LeftIcon />} />);
    
    const icon = screen.getByTestId('left-icon');
    const input = screen.getByRole('textbox');
    
    expect(icon).toBeInTheDocument();
    expect(input).toHaveStyle({ paddingLeft: '28px' }); // 16px icon + 12px padding
  });

  it('应该支持右侧图标', () => {
    const RightIcon = () => <span data-testid="right-icon">清除</span>;
    render(<Input {...defaultProps} rightIcon={<RightIcon />} />);
    
    const icon = screen.getByTestId('right-icon');
    const input = screen.getByRole('textbox');
    
    expect(icon).toBeInTheDocument();
    expect(input).toHaveStyle({ paddingRight: '28px' });
  });

  it('应该支持清除按钮', async () => {
    render(<Input {...defaultProps} clearable defaultValue="测试内容" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('测试内容');
    
    // 检查清除按钮是否存在
    const clearButton = input.parentElement?.querySelector('button');
    expect(clearButton).toBeInTheDocument();
    
    // 点击清除按钮
    if (clearButton) {
      await userEvent.click(clearButton);
      expect(input).toHaveValue('');
    }
  });

  it('应该在禁用时不显示清除按钮', () => {
    render(<Input {...defaultProps} clearable disabled defaultValue="测试内容" />);
    
    const input = screen.getByRole('textbox');
    const clearButton = input.parentElement?.querySelector('button');
    
    expect(clearButton).not.toBeInTheDocument();
  });

  it('应该在只读时不显示清除按钮', () => {
    render(<Input {...defaultProps} clearable readonly defaultValue="测试内容" />);
    
    const input = screen.getByRole('textbox');
    const clearButton = input.parentElement?.querySelector('button');
    
    expect(clearButton).not.toBeInTheDocument();
  });

  it('应该支持最大长度限制', async () => {
    const handleChange = vi.fn();
    render(<Input {...defaultProps} maxLength={10} onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '这是一个超过10个字符的长文本');
    
    expect(input).toHaveValue('这是一个超过10个');
    expect(handleChange).toHaveBeenCalled();
  });

  it('应该支持数字输入的属性', () => {
    render(<Input {...defaultProps} type="number" min={0} max={100} step={1} />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
    expect(input).toHaveAttribute('step', '1');
  });

  it('应该格式化数字输入', async () => {
    const handleChange = vi.fn();
    render(<Input {...defaultProps} type="number" onChange={handleChange} />);
    
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, 'abc123def');
    
    expect(input).toHaveValue('123');
    expect(handleChange).toHaveBeenCalledWith('123', expect.any(Object));
  });

  it('应该格式化邮箱输入', async () => {
    const handleChange = vi.fn();
    render(<Input {...defaultProps} type="email" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test@EXAMPLE.COM');
    
    expect(input).toHaveValue('test@example.com');
    expect(handleChange).toHaveBeenCalledWith('test@example.com', expect.any(Object));
  });

  it('应该支持自动完成', () => {
    render(<Input {...defaultProps} autoComplete="username" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autoComplete', 'username');
  });

  it('应该支持输入模式', () => {
    render(<Input {...defaultProps} inputMode="numeric" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('应该响应焦点事件', async () => {
    const handleFocus = vi.fn();
    render(<Input {...defaultProps} onFocus={handleFocus} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('应该响应失焦事件', async () => {
    const handleBlur = vi.fn();
    render(<Input {...defaultProps} onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.tab(); // 移出焦点
    
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('应该响应键盘事件', async () => {
    const handleKeyDown = vi.fn();
    render(<Input {...defaultProps} onKeyDown={handleKeyDown} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'a');
    
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('应该支持受控模式', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('初始值');
      return (
        <Input 
          value={value}
          onChange={(newValue) => setValue(newValue)}
        />
      );
    };
    
    render(<TestComponent />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('初始值');
    
    await userEvent.clear(input);
    await userEvent.type(input, '新值');
    expect(input).toHaveValue('新值');
  });

  it('应该支持非受控模式', async () => {
    render(<Input {...defaultProps} defaultValue="默认值" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('默认值');
    
    await userEvent.clear(input);
    await userEvent.type(input, '修改值');
    expect(input).toHaveValue('修改值');
  });

  it('应该支持ref转发', () => {
    const ref = { current: null } as React.RefObject<HTMLInputElement>;
    render(<Input {...defaultProps} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('应该支持自定义类名', () => {
    render(<Input {...defaultProps} className="custom-input" containerClassName="custom-container" />);
    
    const container = screen.getByRole('textbox').parentElement;
    const input = screen.getByRole('textbox');
    
    expect(container).toHaveClass('custom-container');
    expect(input).toHaveClass('custom-input');
  });

  it('应该通过其他HTML属性', () => {
    render(<Input {...defaultProps} data-testid="custom-input" name="username" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-testid', 'custom-input');
    expect(input).toHaveAttribute('name', 'username');
  });
});