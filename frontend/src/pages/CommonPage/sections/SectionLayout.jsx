// src/pages/CommonPage/sections/SectionLayout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./SectionLayout.css";

const SectionLayout = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="section-layout-container">
      <div className="section-layout-header">
        <button className="back-btn" onClick={() => navigate("/common")}>
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <h2>{title}</h2>
      </div>

      <div className="section-layout-content">{children}</div>
    </div>
  );
};

export default SectionLayout;
