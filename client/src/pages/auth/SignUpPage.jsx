import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    userType: 'USER',
    // User fields
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    studentId: '',
    stream: '',
    year: '',
    department: '',
    // Organization fields
    name: '',
    description: '',
    officialEmail: '',
    type: '',
    category: '',
    website: '',
    contactNumber: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value) return 'First name is required';
        if (value.length < 2) return 'First name must be at least 2 characters';
        return '';
      case 'lastName':
        if (!value) return 'Last name is required';
        if (value.length < 2) return 'Last name must be at least 2 characters';
        return '';
      case 'email':
      case 'officialEmail':
        if (!value) return 'Email is required';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Password must contain uppercase, lowercase, and number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'userType':
        if (!value) return 'Please select user type';
        return '';
      case 'name':
        if (formData.userType === 'ORGANIZATION' && !value) return 'Organization name is required';
        return '';
      case 'description':
        if (formData.userType === 'ORGANIZATION' && !value) return 'Description is required';
        return '';
      case 'mobileNumber':
      case 'contactNumber':
        if (value && !/^[6-9]\d{9}$/.test(value)) return 'Please enter a valid 10-digit mobile number';
        return '';
      case 'studentId':
        if (formData.userType === 'USER' && value && value.length < 3) return 'Student ID must be at least 3 characters';
        return '';
      case 'stream':
        if (formData.userType === 'USER' && !value) return 'Stream is required';
        return '';
      case 'year':
        if (formData.userType === 'USER' && !value) return 'Year is required';
        return '';
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    // Define required fields based on user type
    const requiredFields = formData.userType === 'USER'
      ? ['userType', 'firstName', 'lastName', 'email', 'password', 'confirmPassword', 'stream', 'year']
      : ['userType', 'name', 'description', 'officialEmail', 'password', 'confirmPassword'];

    // Validate required fields
    requiredFields.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    // Validate optional fields that have values
    Object.keys(formData).forEach(key => {
      if (!requiredFields.includes(key) && formData[key]) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Validate field on change if it was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({
        ...errors,
        [name]: error
      });
    }

    // Special case for confirm password - validate when password changes
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors({
        ...errors,
        confirmPassword: confirmError
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });

    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all required fields as touched based on user type
    const requiredFields = formData.userType === 'USER'
      ? ['userType', 'firstName', 'lastName', 'email', 'password', 'confirmPassword', 'stream', 'year']
      : ['userType', 'name', 'description', 'officialEmail', 'password', 'confirmPassword'];

    const touchedFields = {};
    requiredFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare registration data based on user type
      const registrationData = { ...formData };
      delete registrationData.confirmPassword;
      delete registrationData.userType;

      // Clean up data based on user type
      if (formData.userType === 'USER') {
        // Remove organization-specific fields
        delete registrationData.name;
        delete registrationData.description;
        delete registrationData.officialEmail;
        delete registrationData.type;
        delete registrationData.category;
        delete registrationData.website;
        delete registrationData.contactNumber;
        delete registrationData.address;
      } else {
        // Remove user-specific fields
        delete registrationData.firstName;
        delete registrationData.lastName;
        delete registrationData.email;
        delete registrationData.studentId;
        delete registrationData.stream;
        delete registrationData.year;
        delete registrationData.department;
        delete registrationData.mobileNumber;
      }

      const result = await register(registrationData, formData.userType);

      if (result.success) {
        toast.success('Registration successful! Please check your email for verification.');

        // Redirect to verification page
        navigate('/verify-email', {
          state: {
            email: formData.userType === 'USER' ? formData.email : formData.officialEmail,
            userType: formData.userType
          }
        });
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Section - Content */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
                    Join EventHive Today
                  </h1>
                  <p className="text-xl text-gray-600">
                    Create your account and start managing university events like never before.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    <span className="text-gray-700">Free account creation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    <span className="text-gray-700">Instant access to events</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    <span className="text-gray-700">Secure and verified platform</span>
                  </div>
                </div>

                {/* User Type Info */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="font-semibold text-gray-900 mb-3">Choose Your Account Type:</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-blue-500" />
                      <span><strong>Student:</strong> Register for events, join activities</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 size={16} className="text-purple-500" />
                      <span><strong>Organization:</strong> Create and manage events</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Sign Up Form */}
              <div className="card p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    Create Account
                  </h2>
                  <p className="text-gray-600">
                    Fill in your details to get started
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Type Selection */}
                  <div>
                    <label className="label">Account Type</label>
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`input ${errors.userType ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="USER">Student (Volunteer/Participant)</option>
                      <option value="ORGANIZATION">Organization</option>
                    </select>
                    {errors.userType && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.userType}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Note: Admin accounts are created by system administrators
                    </p>
                  </div>

                  {/* User Fields */}
                  {formData.userType === 'USER' && (
                    <>
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                            placeholder="John"
                            required
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="label">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                            placeholder="Doe"
                            required
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="label">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`input ${errors.email ? 'border-red-500' : ''}`}
                          placeholder="john.doe@gmail.com"
                          required
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Mobile Number and Student ID */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Mobile Number</label>
                          <input
                            type="tel"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.mobileNumber ? 'border-red-500' : ''}`}
                            placeholder="9876543210"
                          />
                          {errors.mobileNumber && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.mobileNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="label">Student ID (Optional)</label>
                          <input
                            type="text"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.studentId ? 'border-red-500' : ''}`}
                            placeholder="STU123456"
                          />
                          {errors.studentId && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.studentId}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Academic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Stream</label>
                          <select
                            name="stream"
                            value={formData.stream}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.stream ? 'border-red-500' : ''}`}
                            required
                          >
                            <option value="">Select Stream</option>
                            <option value="PUC">PUC</option>
                            <option value="B.TECH">B.Tech</option>
                            <option value="M.TECH">M.Tech</option>
                            <option value="MBA">MBA</option>
                            <option value="MCA">MCA</option>
                            <option value="B.SC">B.Sc</option>
                            <option value="M.SC">M.Sc</option>
                            <option value="B.COM">B.Com</option>
                            <option value="M.COM">M.Com</option>
                            <option value="BA">BA</option>
                            <option value="MA">MA</option>
                            <option value="OTHER">Other</option>
                          </select>
                          {errors.stream && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.stream}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="label">Year</label>
                          <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.year ? 'border-red-500' : ''}`}
                            required
                          >
                            <option value="">Select Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                            <option value="5">5th Year</option>
                          </select>
                          {errors.year && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.year}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Department */}
                      <div>
                        <label className="label">Department (Optional)</label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`input ${errors.department ? 'border-red-500' : ''}`}
                          placeholder="Computer Science"
                        />
                        {errors.department && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.department}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Organization Fields */}
                  {formData.userType === 'ORGANIZATION' && (
                    <>
                      {/* Organization Name */}
                      <div>
                        <label className="label">Organization Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`input ${errors.name ? 'border-red-500' : ''}`}
                          placeholder="Student Council"
                          required
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="label">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`input ${errors.description ? 'border-red-500' : ''}`}
                          placeholder="Brief description of your organization"
                          rows="3"
                          required
                        />
                        {errors.description && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.description}
                          </p>
                        )}
                      </div>

                      {/* Official Email */}
                      <div>
                        <label className="label">Official Email</label>
                        <input
                          type="email"
                          name="officialEmail"
                          value={formData.officialEmail}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`input ${errors.officialEmail ? 'border-red-500' : ''}`}
                          placeholder="contact@organization.com"
                          required
                        />
                        {errors.officialEmail && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.officialEmail}
                          </p>
                        )}
                      </div>

                      {/* Contact Number and Website */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Contact Number</label>
                          <input
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.contactNumber ? 'border-red-500' : ''}`}
                            placeholder="9876543210"
                          />
                          {errors.contactNumber && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.contactNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="label">Website (Optional)</label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.website ? 'border-red-500' : ''}`}
                            placeholder="https://organization.com"
                          />
                          {errors.website && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.website}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="label">Address (Optional)</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`input ${errors.address ? 'border-red-500' : ''}`}
                          placeholder="Organization address"
                          rows="2"
                        />
                        {errors.address && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.address}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Password */}
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`input pr-12 ${errors.password ? 'border-red-500' : ''}`}
                        placeholder="Create a strong password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.password}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="label">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`input pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full btn-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <>
                        <UserPlus size={20} className="mr-2" />
                        Create Account
                      </>
                    )}
                  </button>
                </form>

                {/* Sign In Link */}
                <div className="text-center mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/signin"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUpPage;
