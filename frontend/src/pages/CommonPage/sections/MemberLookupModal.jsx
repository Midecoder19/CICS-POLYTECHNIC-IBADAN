import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { api } from "../../../config/api.js";

const MemberLookupModal = ({ societyId, onSelect, onClose }) => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMembers();
  }, [societyId]);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      // Remove society filter to get all members
      const response = await api.get(`/common/members?role=member`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMembers(data.data.users || []);
        } else {
          setError("Failed to load members");
        }
      } else {
        setError("Failed to load members");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    if (!searchQuery) {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.memberNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  };

  const handleSelect = (member) => {
    onSelect(member);
  };

  return (
    <div className="lookup-overlay">
      <div className="lookup-modal">
        <div className="lookup-header">
          <div className="header-content">
            <div className="header-icon">
              <Search size={24} />
            </div>
            <div className="header-text">
              <h3>Select Member</h3>
              <p>Choose a member from the list below</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="lookup-search">
          <div className="search-icon">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by member number or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="lookup-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading members...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button className="retry-btn" onClick={loadMembers}>
                Try Again
              </button>
            </div>
          ) : (
            <div className="lookup-results">
              {filteredMembers.length > 0 ? (
                <>
                  <div className="results-header">
                    <span>{filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found</span>
                  </div>
                  <div className="lookup-list">
                    {filteredMembers.map((member) => (
                      <div
                        key={member._id}
                        className="lookup-item"
                        onClick={() => handleSelect(member)}
                      >
                        <div className="item-avatar">
                          <div className="avatar-circle">
                            {member.firstName?.charAt(0)?.toUpperCase() || 'M'}
                          </div>
                        </div>
                        <div className="item-details">
                          <div className="item-primary">
                            <span className="item-name">{member.firstName} {member.lastName}</span>
                            <span className="item-badge">Member</span>
                          </div>
                          <div className="item-secondary">
                            <span className="item-code">ID: {member.memberNumber}</span>
                          </div>
                        </div>
                        <div className="item-action">
                          <div className="select-indicator">Select</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h4>No members found</h4>
                  <p>
                    {searchQuery
                      ? `No members match "${searchQuery}". Try a different search term.`
                      : "No members are available at this time."
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lookup-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberLookupModal;
