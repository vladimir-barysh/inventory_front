import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App'; // Уберите .tsx

test('renders СкладПро title', () => {
  render(<App />);
  const titleElement = screen.getByText(/СкладПро/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Добро пожаловать/i);
  expect(welcomeElement).toBeInTheDocument();
});