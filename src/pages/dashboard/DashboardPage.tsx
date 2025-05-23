import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, CreditCard, User, Plus, Trash2, File as FileIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import FileManager from '../../components/dashboard/FileManager';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useFileStore } from '../../store/fileStore';
import { supabase } from '../../lib/supabase';

const DashboardPage: React.FC = () => {
  const { user, fetchUserProfile } = useAuthStore();
  const { projects, fetchProjects, deleteProject, loading: projectsLoading } = useProjectStore();
  const { files, fetchFiles, deleteFile } = useFileStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProjects();
    fetchFiles();
  }, [fetchProjects, fetchFiles]);
  
  const getSubscriptionColor = () => {
    switch (user?.tier) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Defensive: ensure projects and files are always arrays
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeFiles = Array.isArray(files) ? files : [];

  // Combine and sort projects and files for recent items
  const recentItems = [
    ...safeProjects.filter(p => p && p.id && p.title && p.createdAt).map(p => ({
      type: 'project',
      id: p.id,
      title: p.title,
      createdAt: p.createdAt,
      content: p.humanizedText || '',
    })),
    ...safeFiles.filter(f => f && f.id && f.name && f.createdAt).map(f => ({
      type: 'file',
      id: f.id,
      title: f.name,
      createdAt: f.createdAt,
      content: '',
      fileType: f.type || '',
      fileSize: f.size || 0,
      filePath: f.path || '',
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  
  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="flex items-center py-6">
                <div className="rounded-full bg-indigo-100 p-3 mr-4">
                  <FileText size={24} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center py-6">
                <div className="rounded-full bg-orange-100 p-3 mr-4">
                  <FileIcon size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Uploaded Files</p>
                  <p className="text-2xl font-bold text-gray-900">{files.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="flex items-center py-6">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <CreditCard size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Credits</p>
                  <p className="text-2xl font-bold text-gray-900">{user?.credits || 0}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="flex items-center py-6">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <User size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscription</p>
                  <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 capitalize ${getSubscriptionColor()}`}>
                    {user?.tier || 'Free'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
      
        {/* File Manager */}
        <div className="mb-8">
          <FileManager />
        </div>
        
        {/* Subscription */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900">Your Subscription</h2>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {user?.tier || 'Free'} Plan
                  </p>
                  <p className="text-gray-600 mt-1">
                    {user?.credits || 0} credits remaining
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <Button
                    variant="outline"
                  >
                    Manage Subscription
                  </Button>
                </div>
              </div>
              
              {user?.tier === 'free' && (
                <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-md p-4">
                  <p className="text-sm text-indigo-700">
                    <strong>Upgrade to unlock more features:</strong> Get additional credits, advanced humanization options, and priority support.
                  </p>
                  <Button
                    className="mt-2"
                    size="sm"
                    onClick={() => navigate('/pricing')}
                  >
                    View Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;