import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders aaa text', () => {
  render(<App />);
  const linkElement = screen.getByText(/aaa/i);
  expect(linkElement).toBeInTheDocument();
});
