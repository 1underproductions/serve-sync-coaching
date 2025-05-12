
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';
import '@testing-library/jest-dom';

describe('Button', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Button>Test Button</Button>);
    expect(getByText('Test Button')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<Button variant="destructive">Destructive Button</Button>);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const { getByText } = render(<Button onClick={handleClick}>Clickable Button</Button>);
    
    await userEvent.click(getByText('Clickable Button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays as disabled when disabled prop is true', () => {
    const { getByText } = render(<Button disabled>Disabled Button</Button>);
    expect(getByText('Disabled Button')).toBeDisabled();
  });
});
