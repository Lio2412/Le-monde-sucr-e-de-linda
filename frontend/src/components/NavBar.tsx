import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface NavBarProps {
  items: NavItem[];
  activeItemId?: string;
  onItemClick?: (item: NavItem) => void;
  className?: string;
  logo?: React.ReactNode;
}

const NavBar: React.FC<NavBarProps> = ({
  items,
  activeItemId,
  onItemClick,
  className = '',
  logo
}) => {
  const handleClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <nav className={`navbar ${className}`} data-testid="navbar">
      {logo && (
        <div className="navbar-logo" data-testid="navbar-logo">
          {logo}
        </div>
      )}
      <ul className="navbar-items" data-testid="navbar-items">
        {items.map((item) => (
          <li
            key={item.id}
            className={`navbar-item ${activeItemId === item.id ? 'active' : ''}`}
            data-testid={`navbar-item-${item.id}`}
          >
            <a
              href={item.href}
              onClick={(e) => handleClick(item, e)}
              className="navbar-link"
              aria-current={activeItemId === item.id ? 'page' : undefined}
            >
              {item.icon && (
                <span className="navbar-icon" data-testid={`navbar-icon-${item.id}`}>
                  {item.icon}
                </span>
              )}
              <span className="navbar-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
