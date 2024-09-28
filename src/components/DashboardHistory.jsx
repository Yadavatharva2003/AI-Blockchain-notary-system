import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DashboardHistory = () => {
  const documentHistory = [
    { fileName: 'Document1.pdf', status: 'Verified', uploadDate: '2023-05-01', uploadTime: '10:00 AM' },
    { fileName: 'Document2.pdf', status: 'In Progress', uploadDate: '2023-05-02', uploadTime: '2:30 PM' },
    { fileName: 'Document3.pdf', status: 'Rejected', uploadDate: '2023-05-03', uploadTime: '4:15 PM' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-12 pb-6 px-4 sm:px-6 lg:px-8">
        <header className="bg-white shadow rounded-lg mb-6">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center">
            <Link to="/" className="mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard History</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentHistory.map((doc, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadTime}</td> {/* New upload time column */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardHistory;
