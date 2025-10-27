import React, { useState } from 'react';
import { X, Upload, Loader, Briefcase, User, Mail, Phone, MapPin, DollarSign, GraduationCap, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const JobApplicationModal = ({ job, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    currentLocation: '',
    preferredLocation: [],
    experience: {
      years: '',
      months: ''
    },
    professionalExperience: [{
      company: '',
      designation: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      responsibilities: '',
      achievements: '',
      technologies: [],
      ctc: '',
      reasonForLeaving: ''
    }],
    currentCompany: '',
    currentDesignation: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    skills: [],
    education: [{
      degree: '',
      specialization: '',
      institution: '',
      passingYear: '',
      percentage: ''
    }],
    resume: null
  });

  const [skillInput, setSkillInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: '',
          specialization: '',
          institution: '',
          passingYear: '',
          percentage: ''
        }
      ]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLocation = () => {
    if (locationInput.trim() && !formData.preferredLocation.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredLocation: [...prev.preferredLocation, locationInput.trim()]
      }));
      setLocationInput('');
    }
  };

  const removeLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      preferredLocation: prev.preferredLocation.filter(l => l !== location)
    }));
  };

  // Professional Experience handlers
  const addProfessionalExperience = () => {
    setFormData(prev => ({
      ...prev,
      professionalExperience: [...prev.professionalExperience, {
        company: '',
        designation: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        responsibilities: '',
        achievements: '',
        technologies: [],
        ctc: '',
        reasonForLeaving: ''
      }]
    }));
  };

  const removeProfessionalExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      professionalExperience: prev.professionalExperience.filter((_, i) => i !== index)
    }));
  };

  const handleProfessionalExperienceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      professionalExperience: prev.professionalExperience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // File upload handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload only PDF files');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSubmit = new FormData();
      
      console.log('Preparing form data:', formData);
      
      // Add all form fields
      formDataToSubmit.append('firstName', formData.firstName);
      formDataToSubmit.append('lastName', formData.lastName);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('phone', formData.phone);
      formDataToSubmit.append('alternatePhone', formData.alternatePhone || '');
      formDataToSubmit.append('currentLocation', formData.currentLocation || '');
      formDataToSubmit.append('preferredLocation', JSON.stringify(formData.preferredLocation));
      
      // Experience
      formDataToSubmit.append('experience[years]', parseInt(formData.experience.years) || 0);
      formDataToSubmit.append('experience[months]', parseInt(formData.experience.months) || 0);
      
      // Professional Experience - only include if there are valid entries
      const validExperiences = formData.professionalExperience.filter(exp => exp.company && exp.designation);
      formDataToSubmit.append('professionalExperience', JSON.stringify(validExperiences));
      
      // Current job details
      formDataToSubmit.append('currentCompany', formData.currentCompany || '');
      formDataToSubmit.append('currentDesignation', formData.currentDesignation || '');
      
      // Only append numeric fields if they have valid values
      const currentCTC = parseFloat(formData.currentCTC);
      if (!isNaN(currentCTC) && currentCTC > 0) {
        formDataToSubmit.append('currentCTC', currentCTC);
      }
      
      const expectedCTC = parseFloat(formData.expectedCTC);
      if (!isNaN(expectedCTC) && expectedCTC > 0) {
        formDataToSubmit.append('expectedCTC', expectedCTC);
      }
      
      const noticePeriod = parseInt(formData.noticePeriod);
      if (!isNaN(noticePeriod) && noticePeriod >= 0) {
        formDataToSubmit.append('noticePeriod', noticePeriod);
      }
      
      // Skills and Education
      formDataToSubmit.append('skills', JSON.stringify(formData.skills));
      formDataToSubmit.append('education', JSON.stringify(
        formData.education.filter(edu => edu.degree && edu.institution)
      ));
      
      // Resume file
      if (formData.resume) {
        formDataToSubmit.append('resume', formData.resume);
        console.log('Resume file added:', formData.resume.name);
      }

      // Log FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formDataToSubmit.entries()) {
        console.log(key, typeof value === 'object' ? 'File' : value);
      }

      await onSubmit(formDataToSubmit);
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Apply for {job.title}</h2>
            <p className="text-gray-400 mt-1">{job.department?.name} • {job.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <User size={20} className="text-primary-400" />
              <span>Personal Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Preferred Locations */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Locations
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                  placeholder="Add location and press Enter"
                  className="flex-1 px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={addLocation}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                >
                  Add
                </button>
              </div>
              {formData.preferredLocation.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.preferredLocation.map((location, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-primary-900/30 text-primary-400 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{location}</span>
                      <button
                        type="button"
                        onClick={() => removeLocation(location)}
                        className="hover:text-primary-300"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Professional Experience */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Briefcase size={20} className="text-primary-400" />
              <span>Professional Experience</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Experience (Years)
                </label>
                <input
                  type="number"
                  name="experience.years"
                  value={formData.experience.years}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Months
                </label>
                <input
                  type="number"
                  name="experience.months"
                  value={formData.experience.months}
                  onChange={handleChange}
                  min="0"
                  max="11"
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Company
                </label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Designation
                </label>
                <input
                  type="text"
                  name="currentDesignation"
                  value={formData.currentDesignation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current CTC (Annual)
                </label>
                <input
                  type="number"
                  name="currentCTC"
                  value={formData.currentCTC}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected CTC (Annual)
                </label>
                <input
                  type="number"
                  name="expectedCTC"
                  value={formData.expectedCTC}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notice Period (Days)
                </label>
                <input
                  type="number"
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Award size={20} className="text-primary-400" />
              <span>Skills</span>
            </h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add skill and press Enter"
                className="flex-1 px-4 py-2 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >
                Add
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 bg-primary-900/30 text-primary-400 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-primary-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Professional Experience */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Briefcase size={20} className="text-primary-400" />
              <span>Detailed Work Experience</span>
            </h3>
            {formData.professionalExperience.map((exp, index) => (
              <div key={index} className="mb-4 p-4 bg-dark-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Experience {index + 1}</h4>
                  {formData.professionalExperience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProfessionalExperience(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleProfessionalExperienceChange(index, 'company', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Designation *
                    </label>
                    <input
                      type="text"
                      value={exp.designation}
                      onChange={(e) => handleProfessionalExperienceChange(index, 'designation', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => handleProfessionalExperienceChange(index, 'startDate', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) => handleProfessionalExperienceChange(index, 'endDate', e.target.value)}
                      disabled={exp.currentlyWorking}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={exp.currentlyWorking}
                        onChange={(e) => handleProfessionalExperienceChange(index, 'currentlyWorking', e.target.checked)}
                        className="rounded bg-dark-700 border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span>Currently working here</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Key Responsibilities
                    </label>
                    <textarea
                      value={exp.responsibilities}
                      onChange={(e) => handleProfessionalExperienceChange(index, 'responsibilities', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe your key responsibilities..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Key Achievements
                    </label>
                    <textarea
                      value={exp.achievements}
                      onChange={(e) => handleProfessionalExperienceChange(index, 'achievements', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Highlight your key achievements..."
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addProfessionalExperience}
              className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
            >
              + Add Another Experience
            </button>
          </div>

          {/* Resume Upload */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Upload size={20} className="text-primary-400" />
              <span>Resume Upload</span>
            </h3>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload size={48} className="text-gray-400" />
                <div>
                  <p className="text-white font-medium">
                    {formData.resume ? formData.resume.name : 'Upload your resume'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    PDF files only, max 5MB
                  </p>
                </div>
              </label>
              {formData.resume && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <span className="text-green-400 text-sm">
                    ✓ {formData.resume.name} ({(formData.resume.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, resume: null }))}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <GraduationCap size={20} className="text-primary-400" />
              <span>Education</span>
            </h3>
            {formData.education.map((edu, index) => (
              <div key={index} className="mb-4 p-4 bg-dark-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Education {index + 1}</h4>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={edu.specialization}
                      onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Passing Year
                    </label>
                    <input
                      type="number"
                      value={edu.passingYear}
                      onChange={(e) => handleEducationChange(index, 'passingYear', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Percentage/CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={edu.percentage}
                      onChange={(e) => handleEducationChange(index, 'percentage', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              + Add Another Education
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Application</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal;
