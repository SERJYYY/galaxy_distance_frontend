import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

interface BreadcrumbItem {
  name: string;
  link?: string;
}

interface BreadcrumbsProps {
  paths?: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ paths = [] }) => {
  return (
    <nav aria-label="breadcrumb" className="breadcrumbs">
      {paths.map((item, index) => (
        <span key={index}>
          {item.link ? (
            <Link to={item.link}>{item.name}</Link>
          ) : (
            <span>{item.name}</span>
          )}
          {index < paths.length - 1 && <span className="breadcrumbs-separator">{">"}</span>}
        </span>
      ))}
    </nav>
  );
};
