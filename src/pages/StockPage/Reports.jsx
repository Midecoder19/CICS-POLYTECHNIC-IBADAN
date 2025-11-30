// src/pages/StockPage/Reports.jsx
import React from "react";
import { FileText, Calendar, Download, Eye, CheckCircle, Clock } from "phosphor-react";

function Reports({ searchQuery }) {
  // Mock report data
  const reports = [
    {
      id: 1,
      title: "Monthly Sales Report",
      date: "2025-10-01",
      status: "Completed",
      description: "Comprehensive sales analysis for October 2025",
      type: "Sales",
      size: "2.4 MB"
    },
    {
      id: 2,
      title: "Stock Audit Report",
      date: "2025-10-05",
      status: "Pending",
      description: "Inventory audit and stock level assessment",
      type: "Inventory",
      size: "1.8 MB"
    },
    {
      id: 3,
      title: "Financial Summary",
      date: "2025-09-30",
      status: "Completed",
      description: "Monthly financial performance overview",
      type: "Finance",
      size: "3.1 MB"
    },
  ];

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status) => {
    return status === "Completed" ? <CheckCircle size={20} /> : <Clock size={20} />;
  };

  const getStatusColor = (status) => {
    return status === "Completed"
      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Sales":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "Inventory":
        return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
      case "Finance":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6">
          <h2 className="text-2xl font-bold text-white">Reports Dashboard</h2>
          <p className="text-indigo-100 mt-1">Access and manage your business reports</p>
        </div>

        <div className="p-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(report.type)}`}>
                          {report.type}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span>{report.status}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{report.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{report.description}</p>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar size={16} className="mr-2" />
                    <span>{new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="mx-2">•</span>
                    <span>{report.size}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors duration-200">
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors duration-200">
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
