import React from "react";
import { Heart, Envelope } from "phosphor-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-auto" style={{ margin: 0, padding: '16px 0', width: '100%', maxWidth: '100%' }}>
      <div className="container-fluid" style={{ padding: '0 15px', maxWidth: '100%', margin: '0 auto' }}>
        <div className="row align-items-center">
          {/* Company Info */}
          <div className="col-lg-4 col-md-6 mb-3 mb-lg-0">
            <div className="d-flex align-items-center mb-2">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                <span className="fw-bold text-white">P</span>
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Polyibadan</h5>
                <small className="text-muted">Cooperative System</small>
              </div>
            </div>
            <p className="mb-0 small text-muted">
              Empowering cooperative societies with modern financial management solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-lg-4 col-md-6 mb-3 mb-lg-0">
            <h6 className="fw-semibold mb-3">Quick Links</h6>
            <div className="row">
              <div className="col-6">
                <ul className="list-unstyled small">
                  <li className="mb-2">
                    <a href="#" className="text-muted text-decoration-none hover-primary">Dashboard</a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-muted text-decoration-none hover-primary">Account</a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-muted text-decoration-none hover-primary">Stock</a>
                  </li>
                </ul>
              </div>
              <div className="col-6">
                <ul className="list-unstyled small">
                  <li className="mb-2">
                    <a href="#" className="text-muted text-decoration-none hover-primary">Reports</a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-muted text-decoration-none hover-primary">Settings</a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-muted text-decoration-none hover-primary">Support</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="col-lg-4 col-md-12">
            <h6 className="fw-semibold mb-3">Connect With Us</h6>
            <div className="d-flex gap-3 mb-3">
              <a href="#" className="text-muted hover-primary" aria-label="GitHub">
                <span className="fw-bold">🐙</span>
              </a>
              <a href="#" className="text-muted hover-primary" aria-label="LinkedIn">
                <span className="fw-bold">💼</span>
              </a>
              <a href="#" className="text-muted hover-primary" aria-label="Twitter">
                <span className="fw-bold">🐦</span>
              </a>
              <a href="mailto:routeritechlimite@gmail.com" className="text-muted hover-primary" aria-label="Email">
                <Envelope size={20} />
              </a>
            </div>
            <div className="small text-muted">
              <p className="mb-1">
                <Envelope size={14} className="me-2" />
                routeritechlimite@gmail.com
              </p>
              <p className="mb-0">
                <span className="me-2">📞</span>
                +234 (0) 123 456 7890
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <hr className="my-4 border-secondary" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0 small text-muted">
              © {currentYear} Polyibadan Cooperative System. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0 small text-muted">
              Made with <Heart size={14} className="text-danger mx-1" weight="fill" /> for cooperative excellence
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
