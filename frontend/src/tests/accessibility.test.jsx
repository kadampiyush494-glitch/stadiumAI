import { render } from '@testing-library/react';
import * as matchers from 'vitest-axe';
import { axe } from 'vitest-axe';
import { expect, test, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';

expect.extend(matchers);

// Mock Google Maps to avoid JSDOM errors
vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue({}),
  })),
}));

test('Layout should have no accessibility violations', async () => {
  vi.stubGlobal('ResizeObserver', vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })));

  const { container } = render(
    <BrowserRouter>
      <div lang="en">
        <header>
            <title>OmniFlow Stadium Assistant</title>
        </header>
        <Layout />
      </div>
    </BrowserRouter>
  );
  
  const results = await axe(container);
  // Manual check if the matcher fails
  if (!results.violations) {
      throw new Error('Axe results invalid');
  }
  if (results.violations.length > 0) {
    console.log('A11y Violations:', JSON.stringify(results.violations, null, 2));
  }
  expect(results.violations.length).toBe(0);
});
