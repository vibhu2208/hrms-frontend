import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, FileSpreadsheet, Link as LinkIcon, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import BulkUploadHelp from '../../components/BulkUploadHelp';

const BulkEmployeeUpload = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'google-sheets'
  const [file, setFile] = useState(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Download sample template
  const downloadTemplate = async () => {
    try {
      const response = await api.get('/employees/bulk/template');
      const sampleData = response.data.data;

      // Convert to CSV
      const csv = Papa.unparse(sampleData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'employee_bulk_upload_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
      console.error('Template download error:', error);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  // Parse CSV/Excel file
  const parseFile = (file) => {
    setLoading(true);
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
          setLoading(false);
          toast.success(`Parsed ${results.data.length} records from CSV`);
        },
        error: (error) => {
          toast.error('Failed to parse CSV file');
          console.error('CSV parse error:', error);
          setLoading(false);
        }
      });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          setParsedData(jsonData);
          setLoading(false);
          toast.success(`Parsed ${jsonData.length} records from Excel`);
        } catch (error) {
          toast.error('Failed to parse Excel file');
          console.error('Excel parse error:', error);
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Extract spreadsheet ID from Google Sheets URL
  const extractSpreadsheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Fetch data from Google Sheets
  const fetchGoogleSheetData = async () => {
    if (!googleSheetUrl) {
      toast.error('Please enter a Google Sheets URL');
      return;
    }

    const spreadsheetId = extractSpreadsheetId(googleSheetUrl);
    if (!spreadsheetId) {
      toast.error('Invalid Google Sheets URL');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/employees/google-sheets/fetch', {
        spreadsheetId,
        range: 'Sheet1!A:AG', // Adjust range as needed
      });

      setParsedData(response.data.data.employees);
      toast.success(`Fetched ${response.data.data.total} records from Google Sheets`);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Sheet is private. Please make it public or use OAuth authentication.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch Google Sheets data');
      }
      console.error('Google Sheets fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate data
  const validateData = async () => {
    if (parsedData.length === 0) {
      toast.error('No data to validate');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/employees/bulk/validate', {
        employees: parsedData
      });

      setValidationResults(response.data.data);
      
      if (response.data.data.invalid === 0) {
        toast.success(`All ${response.data.data.valid} records are valid!`);
      } else {
        toast.error(`${response.data.data.invalid} records have validation errors`);
      }
    } catch (error) {
      toast.error('Validation failed');
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload employees
  const uploadEmployees = async () => {
    if (parsedData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.post('/employees/bulk/create', {
        employees: parsedData
      });

      clearInterval(progressInterval);
      setProgress(100);

      toast.success(response.data.message);
      
      // Reset state after successful upload
      setTimeout(() => {
        navigate('/employees');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 hover:bg-dark-800 rounded-lg"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Bulk Employee Upload</h1>
            <p className="text-gray-400 mt-1">Import employees from CSV, Excel, or Google Sheets</p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="btn-outline flex items-center space-x-2"
        >
          <Download size={20} />
          <span>Download Template</span>
        </button>
      </div>

      {/* Tab Selection */}
      <div className="card">
        <div className="flex space-x-4 border-b border-gray-700 pb-4">
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'file' 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
            }`}
          >
            <Upload size={20} />
            <span>Upload File</span>
          </button>
          <button
            onClick={() => setActiveTab('google-sheets')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'google-sheets' 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
            }`}
          >
            <FileSpreadsheet size={20} />
            <span>Google Sheets</span>
          </button>
        </div>

        {/* File Upload Tab */}
        {activeTab === 'file' && (
          <div className="mt-6 space-y-4">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-white mb-2">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-gray-400 text-sm">
                  CSV, XLSX, or XLS files supported
                </p>
              </label>
            </div>
          </div>
        )}

        {/* Google Sheets Tab */}
        {activeTab === 'google-sheets' && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Google Sheets URL
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <LinkIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="input-field pl-10"
                  />
                </div>
                <button
                  onClick={fetchGoogleSheetData}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Fetching...' : 'Fetch Data'}
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Note: The Google Sheet must be publicly accessible or you need to authenticate
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Data Preview */}
      {parsedData.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Data Preview ({parsedData.length} records)
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={validateData}
                disabled={loading}
                className="btn-outline flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={20} />
                    <span>Validate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Validation Summary */}
          {validationResults && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={20} className="text-green-500" />
                  <div>
                    <p className="text-gray-400 text-sm">Valid Records</p>
                    <p className="text-2xl font-bold text-white">{validationResults.valid}</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle size={20} className="text-red-500" />
                  <div>
                    <p className="text-gray-400 text-sm">Invalid Records</p>
                    <p className="text-2xl font-bold text-white">{validationResults.invalid}</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet size={20} className="text-blue-500" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Records</p>
                    <p className="text-2xl font-bold text-white">{validationResults.total}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Row</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 10).map((row, index) => {
                  const validation = validationResults?.results?.find(r => r.row === index + 1);
                  const isValid = validation?.isValid !== false;
                  
                  return (
                    <tr key={index} className={`border-b border-gray-800 ${!isValid ? 'bg-red-900/20' : ''}`}>
                      <td className="py-3 px-4 text-gray-300">{index + 1}</td>
                      <td className="py-3 px-4 text-white">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{row.email}</td>
                      <td className="py-3 px-4 text-gray-300">{row.phone}</td>
                      <td className="py-3 px-4 text-gray-300">{row.department}</td>
                      <td className="py-3 px-4">
                        {validation ? (
                          isValid ? (
                            <span className="flex items-center space-x-1 text-green-500">
                              <CheckCircle size={16} />
                              <span>Valid</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-red-500">
                              <XCircle size={16} />
                              <span>Invalid</span>
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">Not validated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {parsedData.length > 10 && (
              <p className="text-gray-400 text-sm mt-2 text-center">
                Showing first 10 of {parsedData.length} records
              </p>
            )}
          </div>

          {/* Validation Errors */}
          {validationResults && validationResults.invalid > 0 && (
            <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center space-x-2">
                <AlertCircle size={20} />
                <span>Validation Errors</span>
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {validationResults.results
                  .filter(r => !r.isValid)
                  .map((result, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-white font-medium">Row {result.row}:</p>
                      <ul className="list-disc list-inside text-red-300 ml-4">
                        {result.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Upload Progress</h3>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-primary-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2 text-center">{progress}%</p>
        </div>
      )}

      {/* Action Buttons */}
      {parsedData.length > 0 && (
        <div className="flex items-center justify-end space-x-4">
          <button
            onClick={() => {
              setParsedData([]);
              setValidationResults(null);
              setFile(null);
              setGoogleSheetUrl('');
            }}
            className="btn-outline"
          >
            Clear Data
          </button>
          <button
            onClick={uploadEmployees}
            disabled={uploading || (validationResults && validationResults.invalid > 0)}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload size={20} />
            <span>{uploading ? 'Uploading...' : 'Upload Employees'}</span>
          </button>
        </div>
      )}

      {/* Help Component */}
      <BulkUploadHelp />
    </div>
  );
};

export default BulkEmployeeUpload;
