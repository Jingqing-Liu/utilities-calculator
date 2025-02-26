import React from 'react';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="page">
            <header className="header">
                <h1>Expense Split Calculator</h1>
            </header>
            <nav className="navbar">
                <ul>
                    <li><a href="/home">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
            <main className="content">
                {children}
            </main>
            <footer className="footer">
                <p>© 2025 Jingqing Liu. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
