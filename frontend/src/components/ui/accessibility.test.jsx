import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as matchers from 'vitest-axe/matchers';
import { axe } from 'vitest-axe';
import SkipNav from './SkipNav';
import HighContrastToggle from './HighContrastToggle';

expect.extend(matchers);

describe('Accessibility Scans', () => {
  it('SkipNav should have no accessibility violations', async () => {
    const { container } = render(<SkipNav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('HighContrastToggle should have no accessibility violations', async () => {
    const { container } = render(<HighContrastToggle />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('Static layout landmarks should be valid', async () => {
    const { container } = render(
      <div>
        <header role="banner">Header</header>
        <main id="main-content" role="main">Main Content</main>
        <footer role="contentinfo">Footer</footer>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
