import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SiteHeader } from './site-header';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('SiteHeader', () => {
  it('renders the AirCade logo text', () => {
    render(<SiteHeader />);
    expect(screen.getByText('AirCade')).toBeInTheDocument();
  });

  it('renders navigation links for Studio, Console, and Controller', () => {
    render(<SiteHeader />);
    expect(screen.getByText('Studio')).toBeInTheDocument();
    expect(screen.getByText('Console')).toBeInTheDocument();
    expect(screen.getByText('Controller')).toBeInTheDocument();
  });

  it('renders sign in and sign up links', () => {
    render(<SiteHeader />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('links to correct routes', () => {
    render(<SiteHeader />);

    const studioLink = screen.getByText('Studio').closest('a');
    const consoleLink = screen.getByText('Console').closest('a');
    const controllerLink = screen.getByText('Controller').closest('a');
    const signInLink = screen.getByText('Sign In').closest('a');
    const signUpLink = screen.getByText('Sign Up').closest('a');

    expect(studioLink).toHaveAttribute('href', '/studio');
    expect(consoleLink).toHaveAttribute('href', '/console');
    expect(controllerLink).toHaveAttribute('href', '/controller');
    expect(signInLink).toHaveAttribute('href', '/signin');
    expect(signUpLink).toHaveAttribute('href', '/signup');
  });

  it('renders the home link', () => {
    render(<SiteHeader />);
    const homeLink = screen.getByText('AirCade').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
